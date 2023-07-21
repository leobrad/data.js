export default function formateString(str) {
  return '"' + str + '"';
}

function formaeVal(val) {
  if (typeof val === 'string') {
    return formateString(val);
  } else {
    return val;
  }
}
