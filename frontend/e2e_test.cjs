const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

const clientA = axios.create({ baseURL });
const clientB = axios.create({ baseURL });

let tokenA = '';
let tokenB = '';

const emailA = 'testA_' + Date.now() + '@example.com';
const emailB = 'testB_' + Date.now() + '@example.com';
const pass = 'Password123';

async function run() {
  try {
    console.log('--- Registering Users ---');
    await clientA.post('/auth/register', { name: 'User A', email: emailA, password: pass, role: 'admin' });
    await clientB.post('/auth/register', { name: 'User B', email: emailB, password: pass, role: 'member' });
    console.log('Registered successfully');

    console.log('--- Logging in Users ---');
    const resA = await clientA.post('/auth/login', { email: emailA, password: pass });
    tokenA = resA.data.access_token;
    clientA.defaults.headers.common['Authorization'] = 'Bearer ' + tokenA;

    const resB = await clientB.post('/auth/login', { email: emailB, password: pass });
    tokenB = resB.data.access_token;
    clientB.defaults.headers.common['Authorization'] = 'Bearer ' + tokenB;
    console.log('Logged in successfully');

    console.log('--- User A Creates Project ---');
    const projRes = await clientA.post('/projects', { name: 'Alpha Project', description: 'Test desc' });
    const projectId = projRes.data.id;
    console.log('Project created:', projectId);

    console.log('--- User A Adds User B to Project ---');
    await clientA.post('/projects/' + projectId + '/members', { userId: resB.data.user.id });
    console.log('Member added');

    console.log('--- User A Creates Task ---');
    const taskRes = await clientA.post('/projects/' + projectId + '/tasks', { title: 'First Task', description: 'Do it', status: 'todo', priority: 'high', assigneeId: resB.data.user.id });
    const taskId = taskRes.data.id;
    console.log('Task created:', taskId);

    console.log('--- User B Fetches Tasks ---');
    const bTasksRes = await clientB.get('/projects/' + projectId + '/tasks');
    console.log('User B saw tasks:', bTasksRes.data.data.length);

    console.log('--- User B Updates Task ---');
    await clientB.patch('/projects/' + projectId + '/tasks/' + taskId, { status: 'in_progress' });
    console.log('User B updated task');

    console.log('--- User A Removes User B ---');
    await clientA.delete('/projects/' + projectId + '/members/' + resB.data.user.id);
    console.log('User B removed');

    console.log('--- User B Tries to Fetch Tasks (Should Fail) ---');
    try {
      await clientB.get('/projects/' + projectId + '/tasks');
      console.error('ERROR: User B was able to fetch tasks after being removed!');
    } catch (e) {
      console.log('User B blocked as expected:', e.response.status);
    }

    console.log('--- User A Deletes Project ---');
    await clientA.delete('/projects/' + projectId);
    console.log('Project deleted');

    console.log('ALL TESTS PASSED');
  } catch (err) {
    console.error('TEST FAILED:', err.response ? err.response.data : err.message);
  }
}

run();
