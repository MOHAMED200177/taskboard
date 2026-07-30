const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('Taskboard-API.postman_collection.json', 'utf8'));

// Helper to add examples
function addExample(item, name, code, status, body) {
  if (!item.response) item.response = [];
  
  // Clone the request for the example
  const exampleReq = JSON.parse(JSON.stringify(item.request));
  
  item.response.push({
    name,
    originalRequest: exampleReq,
    status,
    code,
    _postman_previewlanguage: "json",
    header: [
      { key: "Content-Type", value: "application/json" }
    ],
    cookie: [],
    body: JSON.stringify(body, null, 2)
  });
}

// Helper to add basic test script
function addTest(item, tests) {
  if (!item.event) item.event = [];
  
  // check if test event exists
  let testEvent = item.event.find(e => e.listen === 'test');
  if (!testEvent) {
    testEvent = { listen: 'test', script: { type: 'text/javascript', exec: [] } };
    item.event.push(testEvent);
  }
  
  const existingExec = testEvent.script.exec;
  const newExec = [
    ...existingExec,
    ...tests
  ];
  testEvent.script.exec = newExec;
}

// Process Auth
const authFolder = collection.item.find(i => i.name === 'Auth');
if (authFolder) {
  authFolder.item.forEach(req => {
    // Add tests
    if (req.name === 'Register' || req.name === 'Login' || req.name === 'Change Password' || req.name === 'Forgot Password' || req.name === 'Reset Password') {
      addTest(req, [
        "pm.test('Status code is 200 or 201', function () {",
        "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
        "});"
      ]);
    } else {
      addTest(req, [
        "pm.test('Status code is 200', function () {",
        "    pm.response.to.have.status(200);",
        "});"
      ]);
    }

    // Add examples
    if (req.name === 'Register') {
      addExample(req, 'Successful Registration', 201, 'Created', { id: 'uuid', name: 'Mohamed', email: 'mohamed@example.com', role: 'member' });
      addExample(req, 'Conflict (Email Exists)', 409, 'Conflict', { message: 'Email already exists', error: 'Conflict', statusCode: 409 });
      addExample(req, 'Validation Error', 400, 'Bad Request', { message: ['password is too weak'], error: 'Bad Request', statusCode: 400 });
    }
    else if (req.name === 'Login') {
      addExample(req, 'Successful Login', 201, 'Created', { access_token: 'jwt.token.here', user: { id: 'uuid', name: 'Mohamed' } });
      addExample(req, 'Unauthorized (Wrong Password)', 401, 'Unauthorized', { message: 'Invalid credentials', statusCode: 401 });
    }
    else if (req.name === 'Me' || req.name === 'Logout' || req.name === 'Logout All' || req.name === 'Change Password') {
      addExample(req, 'Unauthorized (No Token)', 401, 'Unauthorized', { message: 'Unauthorized', statusCode: 401 });
    }
  });
}

// Process Projects
const projectsFolder = collection.item.find(i => i.name === 'Projects');
if (projectsFolder) {
  projectsFolder.item.forEach(req => {
    addTest(req, [
      "pm.test('Status code is 200 or 201', function () {",
      "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
      "});"
    ]);

    addExample(req, 'Unauthorized (No Token)', 401, 'Unauthorized', { message: 'Unauthorized', statusCode: 401 });
    
    if (req.name.includes('Update') || req.name.includes('Delete') || req.name.includes('Remove')) {
      addExample(req, 'Forbidden (Not Admin)', 403, 'Forbidden', { message: 'Forbidden resource', error: 'Forbidden', statusCode: 403 });
    }
    
    if (req.name.includes('Id') || req.name.includes('Member')) {
      addExample(req, 'Not Found', 404, 'Not Found', { message: 'Project not found', error: 'Not Found', statusCode: 404 });
    }
    
    if (req.request.method === 'POST' || req.request.method === 'PATCH') {
      addExample(req, 'Validation Error', 400, 'Bad Request', { message: ['name must be a string'], error: 'Bad Request', statusCode: 400 });
    }
  });
}

// Process Tasks
const tasksFolder = collection.item.find(i => i.name === 'Tasks');
if (tasksFolder) {
  tasksFolder.item.forEach(req => {
    addTest(req, [
      "pm.test('Status code is 200 or 201', function () {",
      "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
      "});"
    ]);

    addExample(req, 'Unauthorized (No Token)', 401, 'Unauthorized', { message: 'Unauthorized', statusCode: 401 });
    
    if (req.name.includes('Update') || req.name.includes('Delete') || req.name.includes('Remove')) {
      addExample(req, 'Forbidden', 403, 'Forbidden', { message: 'Forbidden resource', error: 'Forbidden', statusCode: 403 });
    }
    
    if (req.name.includes('Id')) {
      addExample(req, 'Not Found', 404, 'Not Found', { message: 'Task not found', error: 'Not Found', statusCode: 404 });
    }
    
    if (req.request.method === 'POST' || req.request.method === 'PATCH') {
      addExample(req, 'Validation Error', 400, 'Bad Request', { message: ['title is required'], error: 'Bad Request', statusCode: 400 });
    }
  });
  
  // Enhance Get All Tasks with query params to demonstrate filtering/sorting/pagination
  const getAllTasks = tasksFolder.item.find(i => i.name === 'Get All Tasks');
  if (getAllTasks) {
    getAllTasks.request.url.query = [
      { key: 'status', value: 'todo', description: 'Filter by status (todo, in_progress, done)', disabled: true },
      { key: 'priority', value: 'high', description: 'Filter by priority (low, medium, high)', disabled: true },
      { key: 'assigneeId', value: '{{userId}}', description: 'Filter by assignee', disabled: true },
      { key: 'search', value: 'design', description: 'Search title and description', disabled: true },
      { key: 'sortBy', value: 'createdAt', description: 'Sort by field', disabled: true },
      { key: 'sortOrder', value: 'DESC', description: 'Sort order (ASC, DESC)', disabled: true },
      { key: 'page', value: '1', description: 'Page number', disabled: true },
      { key: 'limit', value: '10', description: 'Items per page', disabled: true }
    ];
  }
}

fs.writeFileSync('Taskboard-API.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Collection updated successfully');
