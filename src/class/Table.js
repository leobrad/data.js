import global from '~/obj/global';
import deleteRecord from '~/lib/deleteRecord';
import insertRecord from '~/lib/insertRecord';
import selectRecord from '~/lib/selectRecord';
import updateRecord from '~/lib/updateRecord';

const {
  datajs: {
    connection,
    spaceOptimize,
    recordUseCount,
  },
} = global;

function getLength(section) {
  const [l, r] = section;
  return r - l + 1;
}

function pairEqual(c1, c2) {
  let flag = true;
  for (let i = 0; i < c1.length; i += 1) {
    if (c1[i] !== c2[i]) {
      flag = false;
    }
  }
  return flag;
}

function shadowCopyRecord(l, r, o, ans, datas) {
  if (spaceOptimize === true) {
    deepCopyRecord(l, r, o, ans, datas, filters);
  } else {
    for (let i = l; i <= r; i += 1) {
      ans[i - o] = datas[i];
    }
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

function generateBareJump(sections, i, jumps) {
  if (sections[i - 1] !== undefined) {
    const [l1, r1] = sections[i - 1];
    const [l2] = sections[i];
    jumps[r1 + 1] = [l2 - 1, i - 1];
  }
}

function concatSections(sections) {
  if (sections.length === 1) {
    return sections;
  }
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
    this.limit = Number.NEGATIVE_INFINITY;
    if (recordUseCount === true) {
      this.counts = [];
      this.outOfOrder = true;
    }
  }

  emptyCache() {
    this.hash = {};
    this.datas = [];
    if (recordUseCount === true) {
      this.counts = [];
      this.outOfOrder = true;
    }
  }

  reduceRecordsCache(count) {
    const { outOfOrder, } = this;
    if (outOfOrder === true) {
      const { counts, } = this;
      this.orders = counts.map((e, i) => [e, i]);
      this.orders = radixSort(this.orders);
      const { orders, } = this;
      for (let i = 0; i < count; i += 1) {
        const [_, x] = orders[i];
        this.deleteDataById(x);
      }
      this.outOfOrder = false;
    }
  }

  arrangePointers() {
    const { hash, } = this;
    const keys = Object.keys(hash);
    keys.forEach((k) => {
      this.concatSections(k);
    });
    let indexs = new Array(keys.length);
    for (let i = 0; i < indexs.length; i += 1) {
      indexs[i] = i;
    }
    const sets = [];
    while (indexs.length !== 0) {
      const set = [];
      const source = hash[keys[indexs[0]]].sections;
      if (source !== undefined) {
        set.push(indexs[0]);
      }
      for (let i = 1; i < indexs.length; i += 1) {
        const target = hash[keys[indexs[i]]].sections;
        if (source === undefined) {
          if (source === target) {
            indexs.splice(i, 1);
          }
        }
        if (Array.isArray(source) && Array.isArray(target)) {
          if (source.length !== target.length) {
            continue;
          } else {
            let flag = true;
            for (let i = 0; i < source.length; i += 1) {
              if (!pairEqual(source[i], target[i])) {
                flag = false;
                break;
              }
            }
            if (flag === true) {
              set.push(indexs[i]);
              indexs.splice(i, 1);
            }
          }
        }
      }
      indexs.shift();
      if (source !== undefined) {
        sets.push(set);
      }
    }
    sets.forEach((set) => {
      let source;
      const pointers = [];
      set.forEach((x) => {
        const k = keys[x];
        const e = hash[k];
        if (e.type === 's' && source === undefined) {
          source = k;
        } else {
          pointers.push(k);
        }
      });
      pointers.forEach((k) => {
        hash[k] = {
          type: 'p',
          pointer: source,
        };
      });
    });
  }

  countSection(section) {
    const [l, r] = section;
    const { counts, } = this;
    for (let i = l; i <= r; i += 1) {
      if (counts[i] === undefined) {
        counts[i] = 0;
      }
      counts[i] += 1;
      this.outOfOrder = true;
    }
  }

  updateLimit(section, sections) {
    const { length, } = sections;
    const s1 = sections[length - 1];
    const s2 = sections[length - 2];
    const max1 = getLength(s1);
    if (max1 > this.limit) {
      this.limit = max1;
    }
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
      let i = 0;
      this.limit = Number.NEGATIVE_INFINITY;
      while (sections[i + 1] !== undefined) {
        const [l1, r1] = sections[i];
        const max1 = getLength(section[i]);
        if (max1 > this.limit) {
          this.limit = max1;
        }
        const [l2, r2] = sections[i + 1];
        const max2 = getLength(section[i]);
        if (max2 > this.limit) {
          this.limit = max2;
        }
        if (r1 >= l2 - 1) {
          const min = Math.min(l1, l2);
          const max = Math.max(r1, r2);
          sections.splice(i, 2, [min, max]);
          jumps[min] = [max, i];
          generateBareJump(sections, i, jumps);
        } else {
          i += 1;
          generateBareJump(sections, i, jumps);
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
    if (intersections.length === 0) {
      shadowCopyRecord(l1, r1, l1, ans, datas);
      return ans;
    }
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
    if (id === total - 1) {
      const { tb, } = this;
      await deleteRecord(tb, id);
    } else {
      const { tb, } = this;
      const records = await selectRecord(tb, [total - 1, total - 1]);
      const record = records[0];
      await deleteRecord(tb, total - 1);
      record.id = id;
      await updateRecord(tb, record);
    }
  }

  deleteDataById(id) {
    const { hash, datas, } = this;
    if (datas[id] !== undefined) {
      Object.keys(datas[id]).forEach((k) => {
        const { sections, jumps, } = hash[k];
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
            jumps[l] = [id - 1, i];
            jumps[id + 1] = [r, i + 1];
          }
        });
      });
      datas[id] = undefined;
      if (recordUseCount === true) {
        const { counts, } = this;
        counts[id] = 0;
      }
    }
  }

  async delete(id) {
    const { tb, } = this;
    await deleteRecord(tb, id);
    this.deleteDataById(id);
  }

  async update(obj) {
    const { tb, } = this;
    await updateRecord(tb, obj);
    this.deleteDataById(obj.id);
  }

  async select(section, filters, arrange) {
    const { datas, tb, } = this;
    let records;
    if (filters === undefined) {
      records = await selectRecord(tb, section);
      if (Array.isArray(records) && records.length > 1) {
        const [l, r] = section;
        for (let i = l; i <= r; i += 1) {
          datas[i] = records[i - l];
        }
        Object.keys(records[0]).forEach((k) => {
          const o = this.hash[k];
          if (o !== undefined && o.type === 's') {
            const { sections, } = o;
            sections.push(section);
            this.updateLimit(section, sections);
            o.chaotic = true;
          } else {
            this.hash[k] = {
              type: 's',
              sections: [section],
              jumps: [],
              chaotic: false,
            };
            const [l, r] = section;
            const { jumps, } = this.hash[k];
            jumps[l] = [r, 0];
          }
        });
      }
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
                const { sections: s, jumps: j, chaotic, } = this.hash[f];
                this.hash[list[0]] = {
                  type: 's',
                  jumps: j.slice(0, j.length),
                  sections: s.slice(0, s.length),
                  chaotic,
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
            const { sections: s, jumps: j, chaotic, } = this.hash[p];
            this.hash[hash[k][0]] = {
              type: 's',
              jumps: j.slice(0, j.length),
              sections: s.slice(0, s.length),
              chaotic,
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
        if (spaceOptimize === true) {
          deepCopyRecord(l, r, l, records, datas, filters);
        } else {
          records = datas.slice(section[0], section[1] + 1)
        }
      }
      if (recordUseCount === true) {
        this.countSection(section);
      }
    }
    return records;
  }

  calcSections(section, datas, filter) {
    let [index, right] = section;
    const ans = [];
    let pointer = -1;
    this.concatSections(filter);
    if (datas[index] !== undefined && datas[index][filter] !== undefined) {
      const l = getLength([0, index]);
      if (l / this.limit * l >= 12) {
        if (this.limit > Number.NEGATIVE_INFINITY) {
          const { jumps, } = this.hash[filter];
          while (true) {
            if (jumps[index] !== undefined && (datas[index - 1] === undefined || datas[index - 1][filter] === undefined)) {
              const [j, i] = jumps[index];
              index = j;
              pointer = i;
              break;
            } else {
              index -= 1;
            }
          }
        }
      }
    }
    while (index <= right) {
      if (datas[index] === undefined || datas[index][filter] === undefined) {
        let { jumps, sections, } = this.hash[filter];
        if (sections.length === 0) {
          sections.push(section);
          this.updateLimit(section, sections);
          ans.push(section);
          const [l, r] = section;
          this.hash[filter].jumps[l] = [r, 0];
          return ans;
        }
        this.concatSections(filter);
        if (jumps[index] !== undefined && (datas[index - 1] && datas[index - 1][filter] !== undefined)) {
          const [j, p] = jumps[index];
          index = j + 1;
          pointer = p;
        }
        for (let i = pointer; i <= sections.length; i += 1) {
          if (i <= -1 && sections[i] === undefined) {
            const s = sections[i + 1];
            if (s !== undefined) {
              const [l, r] = s;
              if (index < r) {
                pointer = 0;
                const section = [index, r];
                ans.push(section);
                sections.splice(0, 1, section);
                jumps[index] = [r, 0];
                index = r + 1;
                break;
              }
            }
            continue;
          }
          if (i >= sections.length - 1 && sections[i + 1] === undefined) {
            if (sections[i] === undefined || index > sections[i][1]) {
              pointer = sections.length - 1;
              const section = [index, right];
              ans.push(section);
              this.hash[filter].sections.push(section);
              this.updateLimit(section, sections);
              return ans;
            }
            return ans;
          }
          const [l1, r1] = sections[i];
          const [l2, r2] = sections[i + 1];
          if (index > r1 && index < l2) {
            pointer = i + 1;
            const section = [index, l2];
            if (l2 <= right) {
              index = l2;
            }
            ans.push(section);
            sections.splice(0, section);
            jumps[r1 + 1] = [l2 - 1, i];
            break;
          }
        }
      } else {
        const { jumps, sections, } = this.hash[filter];
        if (jumps[index] !== undefined && (datas[index - 1] === undefined || datas[index - 1][filter] === undefined)) {
          const [j, p] = jumps[index];
          index = j + 1;
          pointer = p;
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
