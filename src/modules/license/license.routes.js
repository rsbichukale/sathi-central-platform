const express = require('express');
const router = express.Router();

const licenseController = require('./license.controller');
const validate = require('../../middleware/validate');
const schema = require('./license.schema');

router.post('/register-trial', validate(schema.registerTrialSchema), licenseController.registerTrial);
router.post('/heartbeat', validate(schema.heartbeatSchema), licenseController.heartbeat);
router.post('/validate', validate(schema.validateSchema), licenseController.validate);
router.post('/activate', validate(schema.activateSchema), licenseController.activate);
router.post('/bind-and-activate', validate(schema.bindAndActivateSchema), licenseController.bindAndActivate);

module.exports = router;
