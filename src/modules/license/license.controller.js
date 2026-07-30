const licenseService = require('./license.service');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

exports.registerTrial = async (req, res, next) => {
  try {
    const result = await licenseService.registerTrial(req.body);
    logger.info('License', `Trial registered: ${req.body.mobileNo} (${req.body.requestCode})`);
    res.json(result);
  } catch (error) {
    logger.error('License', 'Trial registration error', { error: error.message });
    next(error);
  }
};

exports.heartbeat = async (req, res, next) => {
  try {
    const result = await licenseService.heartbeat(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.validate = async (req, res, next) => {
  try {
    const result = await licenseService.validate(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.activate = async (req, res, next) => {
  try {
    const result = await licenseService.activate(req.body);
    logger.info('License', `Key activated: ${req.body.requestCode} → ${req.body.activationKey}`);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.bindAndActivate = async (req, res, next) => {
  try {
    const result = await licenseService.bindAndActivate(req.body);
    logger.info('License', `Key bind and activate: ${req.body.requestCode} → ${req.body.activationKey}`);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
