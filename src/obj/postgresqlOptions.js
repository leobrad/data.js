import { Client, } from 'pg';

const client = new Client();

const options = {
  type: 'postgresql',
  connection: client.connect(),
  recordUseCount: true,
};


export default options;
