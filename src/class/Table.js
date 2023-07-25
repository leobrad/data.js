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

function shadowCopyRecord(l, r, o, ans, datas) {
  for (let i = l; i <= r; i += 1) {
    ans[i - o] = datas[i];
  }
}

function deepCopyRecord(l, r, o, ans, datas, filters) {
  for (let i = l; i <= r; i += 1) {
    if (ans[i - o] === undefined) {
      ans[i - o] = {};
    }
    filters.forEach((f) => {
      ans[i - o][f] = datas[i][f];
    });
  }
}

function concatSections(sections) {
  if (sections.length === 1) {
    return sections;
  }
  let status = 0;
  let i = 0;
  while (sections[i + 1] !== undefined) {
    const [l1, r1] = sections[i];
    const [l2, r2] = sections[i + 1];
    if (r1 >= l2 - 1) {
      const min = Math.min(l1, l2);
      const max = Math.max(r1, r2);
      sections.splice(i, 2, [min, max]);
    } else {
      i += 1;
    }
  }
  return sections;
}


function radixSort(list) {
  list = list.map((e) => [e[0], e]);
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
        ans.unshift(list[e][1]);
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
    let { sections, jumps, } = this.hash[filter];
    if (sections.length === 0) {
      return;
    }
    const { chaotic, } = this.hash[filter];
    if (chaotic === true) {
      this.hash[filter].sections = radixSort(sections);
      sections = this.hash[filter].sections;
      let status = 0;
      let i = 0;
      while (sections[i + 1] !== undefined) {
        const [l1, r1] = sections[i];
        const [l2, r2] = sections[i + 1];
        if (r1 >= l2 - 1) {
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

  arrangeRecords(datas, section, filters) {
    const hash = {};
    const ans = [];
    filters.forEach((f) => {
      hash[f] = true;
    });
    const min = {};
    Object.keys(this.hash).forEach((k) => {
      if (hash[k] === undefined) {
        if (this.hash[k].type === 's') {
          min[k] = true;
        } else {
          min[this.hash[k].pointer] = true;
        }
      }
    });
    let intersections = [];
    const [l1, r1] = section;
    Object.keys(min).forEach((k) => {
      this.concatSections(k);
      const { sections, } = this.hash[k];
      sections.forEach((s) => {
        const [l2, r2] = s;
        if (!(r2 < l1 || l2 > r1)) {
          const min = Math.min(r1, r2);
          const max = Math.max(l1, l2);
          intersections.push([max, min]);
        }
      });
    });
    intersections = radixSort(intersections);
    intersections = concatSections(intersections);
    if (intersections.length === 1) {
      const [l3, r3]= intersections[0];
      if (l3 > l1) {
        shadowCopyRecord(l1, l3 - 1, l1, ans, datas);
      }
      deepCopyRecord(l3, r3, l1, ans, datas, filters);
      if (r3 < r1) {
        shadowCopyRecord(r3 + 1, r1, l1, ans, datas);
      }
    } else {
      const left = intersections[0][0];
      if (left > l1) {
        shadowCopyRecord(left, l1 - 1, l1, ans, datas);
      }
      for (let i = 0; i < intersections.length - 1; i += 1) {
        const [l3, r3] = intersections[i];
        const [l4, r4] = intersections[i + 1];
        deepCopyRecord(l3, r3, l1, ans, datas, filters);
        deepCopyRecord(l4, r4, l1, ans, datas, filters);
        shadowCopyRecord(r3 + 1, l4 - 1, l1, ans, datas);
      }
      const right = intersections[intersections.length - 1][1];
      if (right < l1) {
        deepCopyRecord(right + 1, l1, l1, ans, datas, filters);
      }
    }
    return ans;
  }

  async insert(cnt) {
    const { tb, } = this;
    if (Array.isArray(cnt)) {
      await insertRecord(tb, cnt);
    } else {
      await insertRecord(tb, [cnt])
    }
  }

  async deleteExchange(id, total) {
    if (id === total) {
      const { tb, } = this;
      await deleteRecord(tb, id);
    } else {
      const { tb, } = this;
      const records = await selectRecord(tb, [total - 1, total - 1]);
      const record = records[0];
      await deleteRecord(tb, total);
      record.id = id;
      await updateRecord(tb, record);
    }
  }

  deleteKeySections(id) {
    const { hash, datas, } = this;
    if (datas[id] !== undefined) {
      Object.keys(datas[id]).forEach((k) => {
        const { sections, } = hash[k];
        sections.forEach((s, i) => {
          const [l, r] = s;
          if (id === l) {
            sections[i] = [l + 1, r];
          }
          if (id === r) {
            sections[i] = [l, r - 1];
          }
          if (id > l && id < r) {
            sections.splice(i, 1, [l, id - 1], [id + 1, r]);
            jumps[l] = id - 1;
            jumps[id + 1] = r;
          }
        });
      });
      datas[id] = undefined;
    }
  }

  async delete(id) {
    const { tb, } = this;
    await deleteRecord(tb, id);
    this.deleteKeySections(id);
  }

  async update(obj) {
    const { tb, } = this;
    await updateRecord(tb, obj);
    this.deleteKeySections(obj.id);
  }

  async select(section, filters, arrange) {
    const { datas, tb, } = this;
    let records;
    if (filters === undefined) {
      records = await selectRecord(tb, section);
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
          const pointer = this.hash[f].pointer;
          if (hash[pointer] === undefined) {
            hash[pointer] = [];
          }
          hash[pointer].push(f);
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
          const h = {};
          hash[k].forEach((e) => {
            h[e] = true;
          });
          const lists = {};
          Object.keys(this.hash).forEach((e) => {
            const o = this.hash[e];
            const { pointer: p, } = o;
            if (o.type === 'p' && h[p] === true) {
              if (lists[p] === undefined) {
                lists[p] = [];
              }
              lists[p].push(e);
            }
          });
          for (let j = 0; j < hash[k].length; j += 1) {
            const f = hash[k][j];
            if (hash[f] === undefined) {
              const list = lists[f];
              if (Array.isArray(list)) {
                const { sections: s, jumps: j, } = this.hash[f];
                this.hash[list[0]] = {
                  type: 's',
                  jumps: j.slice(0, j.length),
                  sections: s.slice(0, s.length),
                  chaotic: s.chaotic,
                };
                for (let i = 1; i < list.length; i += 1) {
                  this.hash[list[i]] = {
                    type: 'p',
                    pointer: list[0],
                  };
                }
              }
              const sections = this.calcSections(section, datas, f);
              await this.cacheSections(sections, datas, f);
            }
          }
        } else {
          if (k !== '*rest' && source[this.hash[hash[k][0]].pointer] === undefined) {
            const p = this.hash[hash[k][0]].pointer;
            const { sections: s, jumps: j, } = this.hash[p];
            this.hash[hash[k][0]] = {
              type: 's',
              jumps: j.slice(0, j.length),
              sections: s.slice(0, s.length),
              chaotic: s.chaotic,
            };
            for (let j = 1; j < hash[k].length; j += 1) {
              this.hash[hash[k][j]] = {
                type: 'p',
                pointer: hash[k][0],
              };
            }
            const sections = this.calcSections(section, datas, hash[k][0]);
            await this.cacheSections(sections, datas, hash[k][0]);
            for (let j =0; j < hash[k].length; j += 1) {
              const f = hash[k][j];
              await this.cacheSections(sections, datas, f);
            }
          } else {
            if (k !== '*rest') {
              const s = this.hash[hash[k][0]].pointer;
              const sections = this.calcSections(section, datas, s);
              await this.cacheSections(sections, datas, s);
              for (let j = 0; j < hash[k].length; j += 1) {
                const f = hash[k][j];
                await this.cacheSections(sections, datas, f);
              }
            }
          }
        }
      }
      if (arrange === true) {
        records = this.arrangeRecords(datas, section, filters);
      } else {
        records = datas.slice(section[0], section[1] + 1)
      }
    }
    return records;
  }

  calcSections(section, datas, filter) {
    let [index, right] = section;
    const ans = [];
    let pointer = -1;
    let status = 0;
    let start = index;
    while (index <= right) {
      if (datas[index] === undefined || datas[index][filter] === undefined) {
        status = 0;
        let { jumps, sections, } = this.hash[filter];
        if (sections.length === 0) {
          sections.push(section);
          ans.push(section);
          const [l, r] = section;
          this.hash[filter].jumps[l] = r;
          return ans;
        }
        this.concatSections(filter);
        for (let i = pointer; i <= sections.length; i += 1) {
          if (i <= -1 && sections[i] === undefined) {
            if (sections[i + 1] !== undefined) {
              if (index < sections[i + 1][0]) {
                pointer = 0;
                const section = [index, sections[i + 1][0]];
                ans.push(section);
                sections.push(section);
                index = sections[i + 1][0];
                this.hash[filter].chaotic = true;
                break;
              }
            }
            continue;
          }
          if (i >= sections.length - 1 && sections[i + 1] === undefined) {
            if (sections[i] === undefined || index > sections[i][1]) {
              pointer = sections.length - 1;
              const section = [start, right];
              ans.push(section);
              this.hash[filter].sections.push(section);
              jumps[start] = section[1];
              this.hash[filter].chaotic = true;
              return ans;
            }
            return ans;
          }
          const [l1, r1] = sections[i];
          const [l2, r2] = sections[i + 1];
          if (index > r1 && index < l2) {
            pointer = i;
            const section = [index, l2];
            if (l2 <= right) {
              index = l2;
            }
            ans.push(section);
            sections.push(section);
            this.hash[filter].chaotic = true;
            break;
          }
          start = index;
          jumps[start] = undefined;
        }
      } else {
        status = 1;
        const { jumps, sections, } = this.hash[filter];
        if (jumps[index] !== undefined && (datas[index - 1] === undefined || datas[index - 1][filter] === undefined)) {
          index = jumps[index] + 1;
        } else {
          this.concatSections(filter);
          const sections = this.hash[filter].sections;
          for (let i = pointer; i < sections.length; i += 1) {
            if (sections[i] !== undefined) {
              const [l, r] = sections[i];
              if (index >= l && index <= r) {
                pointer = i;
                index = r + 1;
                break;
              }
            }
          }
        }
      }
    }
    return ans;
  }
}

export default Table;
