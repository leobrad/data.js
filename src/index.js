import Users from '~/class/table/Users';
import global from '~/obj/global';

global.user.tb = new Users();

async function main() {
  let users = await global.user.tb.select([5, 7], ['age', 'gender', 'city']);
  users = await global.user.tb.select([2, 10], ['name', 'age'], true);
  users = await global.user.tb.select([9, 12], ['gender', 'city', 'country'], true);
}
main();
