import Users from '~/class/table/Users';
import global from '~/obj/global';

global.user.tb = new Users();

async function main() {
  let users = await global.user.tb.select([5, 7], ['age', 'gender', 'city']);
  console.log('------');
  users = await global.user.tb.select([2, 10], ['name', 'age'], true);
  console.log(users);
}
main();
