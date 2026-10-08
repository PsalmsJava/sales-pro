const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const authValidators = {
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required'
        })
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().pattern(passwordPattern).required().messages({
            'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
            'any.only': 'Passwords do not match'
        })
    })
};

const userValidators = {
    createUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(passwordPattern).required(),
        firstName: Joi.string().trim().min(2).max(100).required(),
        lastName: Joi.string().trim().min(2).max(100).required(),
        phone: Joi.string().optional(),
        role: Joi.string().valid('admin', 'sales_rep', 'dispatch_partner', 'head_of_sales', 'inventory_manager').required()
    })
};

const productValidators = {
    createProduct: Joi.object({
        name: Joi.string().trim().min(3).max(255).required(),
        description: Joi.string().trim().max(2000).optional(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(0).required(),
        sku: Joi.string().trim().optional(),
        imageUrl: Joi.string().uri().optional(),
        isActive: Joi.boolean().optional()
    }),
    updateProduct: Joi.object({
        name: Joi.string().trim().min(3).max(255),
        description: Joi.string().trim().max(2000),
        price: Joi.number().min(0),
        quantity: Joi.number().integer().min(0),
        sku: Joi.string().trim(),
        imageUrl: Joi.string().uri(),
        isActive: Joi.boolean()
    }).min(1),
    updateStock: Joi.object({
        quantity: Joi.number().integer().min(1).required(),
        operation: Joi.string().valid('add', 'subtract').required()
    })
};

const orderValidators = {
    createOrder: Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        paymentMethod: Joi.string().valid('online', 'delivery').required(),
        notes: Joi.string().max(500).optional(),
        customer: Joi.object({
            firstName: Joi.string().trim().min(2).max(100).required(),
            lastName: Joi.string().trim().min(2).max(100).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required()
        }).required(),
        utm_source: Joi.string().optional(),
        utm_medium: Joi.string().optional(),
        utm_campaign: Joi.string().optional()
    }),
    updateStatus: Joi.object({
        status: Joi.string().valid(
            'pending', 'assigned', 'confirmed', 'processing',
            'dispatched', 'delivered', 'completed', 'cancelled'
        ).required()
    })
};


const commissionValidators = {
    setCommission: Joi.object({
        structure: Joi.string().valid('commission_only', 'salary_only', 'salary_plus_commission').required(),
        baseSalary: Joi.number().min(0).default(0),
        commissionPercentage: Joi.number().min(0).max(100).default(0)
    })
};

const dispatchValidators = {
    registerPartner: Joi.object({
        companyName: Joi.string().trim().min(2).max(255).required(),
        contactPerson: Joi.string().trim().min(2).max(255).required(),
        contactPhone: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        vehicleType: Joi.string().optional(),
        licenseNumber: Joi.string().optional()
    }),
    assignDelivery: Joi.object({
        orderId: Joi.string().uuid().required(),
        dispatchPartnerId: Joi.string().uuid().required(),
        deliveryFee: Joi.number().min(0).required()
    }),
    updateDeliveryStatus: Joi.object({
        status: Joi.string().valid('picked_up', 'in_transit', 'delivered', 'failed').required(),
        notes: Joi.string().optional(),
        recipientName: Joi.string().optional(),
        signature: Joi.string().optional(),
        proofOfDeliveryUrl: Joi.string().uri().optional()
    })
};

const salesRepValidators = {
    createSalesRep: Joi.object({
        email: Joi.string().email().required(),
        firstName: Joi.string().trim().min(2).max(100).required(),
        lastName: Joi.string().trim().min(2).max(100).required(),
        phone: Joi.string().optional(),
        commissionStructure: Joi.string().valid('commission_only', 'salary_only', 'salary_plus_commission').optional(),
        baseSalary: Joi.number().min(0).optional(),
        commissionPercentage: Joi.number().min(0).max(100).optional()
    }),
    updateSalesRep: Joi.object({
        firstName: Joi.string().trim().min(2).max(100),
        lastName: Joi.string().trim().min(2).max(100),
        phone: Joi.string(),
        email: Joi.string().email(),
        isActive: Joi.boolean(),
        commissionStructure: Joi.string().valid('commission_only', 'salary_only', 'salary_plus_commission'),
        baseSalary: Joi.number().min(0),
        commissionPercentage: Joi.number().min(0).max(100)
    }).min(1),
    toggleActive: Joi.object({
        action: Joi.string().valid('deactivate', 'reactivate').required()
    })
};

const paymentValidators = {
    initializePayment: Joi.object({
        orderId: Joi.string().uuid().required(),
        provider: Joi.string().valid('paystack', 'flutterwave').required()
    }),
    toggleMethod: Joi.object({
        method: Joi.string().valid('online', 'delivery').required(),
        enabled: Joi.boolean().required()
    })
};


module.exports = {
    authValidators,
    userValidators,
    productValidators,
    orderValidators,
    commissionValidators,
    dispatchValidators,
    salesRepValidators,
    paymentValidators
};