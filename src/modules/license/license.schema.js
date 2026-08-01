const { z } = require('zod');

exports.registerTrialSchema = z.object({
  body: z.object({
    requestCode: z.string().min(1, 'Request Code is required'),
    mobileNo: z.string().min(10, 'Mobile Number must be valid'),
    firmName: z.string().optional(),
    tallySerial: z.string().optional(),
    macAddress: z.string().optional()
  })
});

exports.heartbeatSchema = z.object({
  body: z.object({
    requestCode: z.string().min(1, 'Request Code is required'),
    macAddress: z.string().optional(),
    tallySerial: z.string().optional()
  })
});

exports.validateSchema = z.object({
  body: z.object({
    requestCode: z.string().optional(),
    serialNumber: z.string().optional(),
    activationKey: z.string().min(1, 'Activation key is required')
  })
});

exports.activateSchema = z.object({
  body: z.object({
    requestCode: z.string().min(1, 'Request Code is required'),
    activationKey: z.string().min(25, 'Activation Key must be 25 characters')
  })
});

exports.bindAndActivateSchema = z.object({
  body: z.object({
    apiKey: z.string().optional(),
    activationKey: z.string().min(1, 'Activation Key is required'),
    requestCode: z.string().min(1, 'Request Code is required'),
    tallySerial: z.string().optional(),
    macAddress: z.string().optional()
  })
});
