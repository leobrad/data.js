import Users from '~/class/table/Users';
import global from '~/obj/global';

global.user.tb = new Users();

async function main() {
  const users = await global.user.tb.select([5, 5]);
  console.log(users);
}
main();
