const axios = require("axios")

//log req backend
function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl} => ${res.statusCode} (${duration} ms)`;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    await Log('backend', level, 'middleware', logMessage);
  });

  next();
}

//resuable lof function
 async function Log(stack, level, packageName, message) {
  try {
  
    const allowedStacks = ['backend', 'frontend'];
    const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const allowedPackages = [
      'cache', 'controller', 'cron_job', 'db', 'domain',
      'handler', 'repository', 'route', 'service',
      'api', 'component', 'hook', 'page', 'state', 'style',
      'auth', 'config', 'middleware', 'utils',
    ];

  //validete stack
    if (!allowedStacks.includes(stack)) throw new Error(`Invalid stack: ${stack}`);
    if (!allowedLevels.includes(level)) throw new Error(`Invalid level: ${level}`);
    if (!allowedPackages.includes(packageName)) throw new Error(`Invalid package: ${packageName}`);

    //req
    const payload = { stack, level, package: packageName, message };
    const res = await axios.post(
      'http://20.244.56.144/evaluation-service/logs',
      payload
    );

    return res.data;
  } catch (error) {
    console.error('Error sending log:', error.message);
    return { error: error.message };
  }
}
module.exports = { requestLogger, Log };