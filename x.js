import fs from 'fs/promises';
const f = await fs.open('data', 'a+');


//await fd.write(bytes, 0, bytes.length);

const r = async (size, offset = 0, position = 0) => {
  const readArr = new Uint8Array(size);
  await f.read(readArr, offset, size, position);
  return readArr;
}
const w = async (arr, offset = 0, position = 0) => {
  const bytes = new Uint8Array(arr);
  await f.write(bytes, offset, bytes.length, position);
}

const T_STRING = 1;
const BYTES_NUMBER = 1;

await w([88], 0, 40);
//console.log(await r(100));

await f.close();

//id and size of the bytes to read