import global from '~/obj/global';
import deleteRecord from '~/lib/deleteRecord';
import insertRecord from '~/lib/insertRecord';
import selectRecord from '~/lib/selectRecord';
import updateRecord from '~/lib/updateRecord';

const {
  datajs: {
    connection,
  },
} = global;

function radixSort(list) {
  list = list.map((e) => [e, e]);
  const bucket = new Array(10);
  while (true) {
    for (let i = 0; i < bucket.length; i += 1) {
      bucket[i] = undefined;
    }
    let flag = 0;
    list.forEach((e, i) => {
      const [s] = e;
      const m = s % 10;
      if (bucket[m] === undefined) {
        bucket[m] = [];
      }
      bucket[m].unshift(i);
      const r = parseInt(s / 10);
      if (r !== 0) {
        flag += 1;
      }
      list[i][0] = r;
    });
    if (flag === 0) {
      break;
    }
    const newList = [];
    for (let i = 0; i < bucket.length; i += 1) {
      if (Array.isArray(bucket[9 - i])) {
        bucket[9 - i].forEach((e) => {
          newList.unshift(list[e]);
        });
      }
    }
    list = newList;
  }
  const ans = [];
  for (let i = 0; i < bucket.length; i += 1) {
    if (Array.isArray(bucket[9 - i])) {
      bucket[9 - i].forEach((e) => {
        ans.push(list[e][1]);
      });
    }
  }
  return ans;
}

class Table {
  constructor(tb) {
    this.tb = tb;
    this.hash = {};
    this.datas = [];
    this.exists = false;
  }

  async cacheSections(sections, datas, filter) {
    const { tb, } = this;
    for (let i = 0; i < sections.length; i += 1) {
      const s = sections[i];
      const records = await selectRecord(tb, s, [filter]);
      const [l, r] = s;
      for (let i = 0; i <= r - l; i += 1) {
        if (datas[l + i] === undefined) {
          datas[l + i] = {};
        }
        datas[l + i][filter] = records[i][filter];
      }
    }
  }

  concatSections(filter) {
    const { sections, jumps, } = this.hash[filter];
    if (sections.length === 0) {
      return;
    }
    const { chaotic, } = this.hash[filter];
    if (chaotic === true) {
      this.hash[filter].sections = radixSort(sections);
      let status = 0;
      let i = 0;
      while (sections[i + 1] !== undefined) {
        const [l1, r1] = sections[i];
        const [l2, r2] = sections[i + 1];
        if (r1 >= l2) {
          const min = Math.min(l1, l2);
          const max = Math.max(r1, r2);
          sections.splice(i, 2, [min, max]);
          jumps[min] = max;
        } else {
          i += 1;
        }
      }
      this.hash[filter].chaotic = false;
    }
  }

  async insert(message) {
    const { tb, } = this;
    await insertRecord(tb, message);
  }

  async deleteExchange(message, total) {
    if (message === total) {
      const { tb, } = this;
      await deleteRecord(tb, message);
    } else {
      const { tb, } = this;
      const lastDatas = await selectRecord(tb, [total, total]);
      const lastData = lastDatas[0];
      await deleteRecord(tb, total);
      lastData.id = message.id;
      await updateRecord(tb, lastData);
    }
  }

  deleteKeySections(id) {
    const { hash, } = this;
    if (this.datas[id]) {
      Object.keys(this.datas[id]).forEach((k) => {
        const { sections, } = hash[filter];
        sections.forEach((s, i) => {
          const [l, r] = s;
          if (id === l) {
            sections[i] = [l + 1, r];
          }
          if (id === r) {
            sections[i] = [l, r - 1];
          }
          if (id > l && id < r) {
            sections.splice(i, 1);
            sections.push([l, id - 1]);
            sections.push([id + 1, r]);
            this.hash[filter].chaotic = true;
          }
        });
      });
      this.datas[id] = undefined;
    }
  }

  async delete(id) {
    const { tb, } = this;
    await deleteRecord(tb, id);
    this.deleteKeySections(id);
  }

  async update(message) {
    const { tb, } = this;
    await updateRecord(tb, message);
    this.deleteKeySections(message.id);
  }

  async select(section, filters) {
    const { datas, tb, } = this;
    let records;
    if (section === undefined) {
      records = await selectRecord(tb, undefined, filters);
    } else {
      const hash = {};
      const source = {};
      filters.forEach((f, i) => {
        if (this.hash[f] === undefined) {
          if (hash['*null'] === undefined) {
            hash['*null'] = [];
          }
          hash['*null'].push(f);
        } else if (this.hash[f].type === 'p') {
          if (hash[f] === undefined) {
            hash[f] = [];
          }
          hash[f].push(f);
        } else {
          if (hash['*rest'] === undefined) {
            hash['*rest'] = [];
          }
          hash['*rest'].push(f);
        }
        if (this.hash[f] && this.hash[f].type === 's') {
          source[f] = true;
        }
      });
      const keys = Object.keys(hash);
      for (let i = 0; i < keys.length; i += 1) {
        const k = keys[i];
        if (k === '*null') {
          this.hash[hash[k][0]] = {
            type: 's',
            jumps: [],
            sections: [],
            chaotic: false,
          };
          for (let j = 1; j < hash[k].length; j += 1) {
            this.hash[hash[k][j]] = {
              type: 'p',
              pointer: hash[k][0],
            };
          }
          const sections = this.calcSections(section, datas, hash[k][0]);
          for (let j = 0; j < hash[k].length; j += 1) {
            const f = hash[k][j];
            await this.cacheSections(sections, datas, f);
          }
        } else if (k === '*rest') {
          for (let j = 0; j < hash[k].length; j += 1) {
            const f = hash[k][j];
            if (!source[f]) {
              const s = this.calcSections(section, datas, f);
              await this.cacheSections(sections, datas, f);
            }
          }
        } else {
          if (source[this.hash[hash[k][0]].pointer] === undefined) {
            hash[k][0] = {
              type: 's',
              jumps: [],
              sections: [],
              chaotic: false,
            };
            for (let j = 1; j < hash[k].length; j += 1) {
              hash[k][j] = {
                type: 'p',
                pointer: hash[k][0],
              };
            }
            const sections = this.calcSections(section, datas, hash[k][0]);
            this.cacheSections(sections, datas, s);
            for (let j = 0; j < hash[k].length; j += 1) {
              const f = hash[k][j];
              await this.cacheSections(sections, datas, f);
            }
          } else {
            const s = this.hash[hash[k][0]].pointer;
            const sections = this.calcSections(section, datas, s);
            this.cacheSections(sections, datas, s, section);
            for (let j = 0; j < hash[k].length; j += 1) {
              const f = hash[k][j];
              await this.cacheSections(sections, datas, f);
            }
          }
        }
      }
      records = datas.slice(section[0], section[1] + 1)
    }
    return records;
  }

  calcSections(section, datas, filter) {
    let [index, right] = section;
    const ans = [];
    let pointer = -1;
    let status = 0;
    let start;
    while (index <= right) {
      if (datas[index] === undefined || datas[index][filter] === undefined) {
        status = 0;
        const { jumps, sections, } = this.hash[filter];
        if (sections.length === 0) {
          sections.push(section);
          ans.push(section);
          this.hash[filter].chaotic = true;
          const [l, r] = section;
          this.hash[filter].jumps[l] = r;
          return ans;
        }
        this.concatSections(filter);
        for (let i = pointer; i <= sections.length; i += 1) {
          if (section[i] === undefined) {
            if (sections[i + 1] !== undefined) {
              if (index < sections[i + 1][0]) {
                pointer = 0;
                index = sections[i + 1][0];
                const section = [index, sections[i + 1][0]];
                ans.push(section);
                sections.push(section);
                this.hash[filter].chaotic = true;
              }
            }
            continue;
          }
          if (sections[i + 1] === undefined) {
            if (index > sections[i][1]) {
              pointer = sections.length - 1;
              pointer = right;
              const section = [index, right];
              ans.push(section);
              sections.push(section);
              this.hash[filter].chaotic = true;
              return ans;
            }
          }
          const [l1, r1] = sections[i];
          const [l2, r2] = sections[i + 1];
          if (index > r1 && index < l2) {
            pointer = l1;
            index = l1;
            const section = [index, l1];
            ans.push(section);
            sections.push(section);
            this.hash[filter].chaotic = true;
          }
          start = index;
          this.hash[filter][start] = undefined;
        }
      } else {
        status = 1;
        const { jumps, } = this.hash[filter];
        if (jumps[i] !== undefined) {
          index = jumps[i];
          for (let i = pointer; i < sections.length; i += 1) {
            if (section[0] === i) {
              sections.splice(i, 1);
              pointer = section[i + 1][0];
              break;
            }
          }
        } else {
          this.concatSections(filter);
          for (let i = pointer; i < sections.length; i += 1) {
            const [l, r] = sections[i];
            if (index >= l && index <= r) {
              pointer = sections[i + 1][0];
              index = r + 1;
              break;
            }
          }
        }
      }
    }
    const { jumps, } = this.hash[filter];
    if (status = 0) {
      if (start !== undefined) {
        jumps[start] = right;
      }
    } else {
      const { sections, } = this.hash[filter];
      for (let i = pointer; i < sections.length; i += 1) {
        if (right < sections[i][1]) {
          jumps[start] = sections[i][1];
          break;
        }
      }
    }
    return ans;
  }
}

export default Table;
