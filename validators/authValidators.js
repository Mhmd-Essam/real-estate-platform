const Joi = require("joi");

const authValidation = Joi.object({
  userName: Joi.string().required().trim().min(3).max(12).messages({
    "any.required": "please enter the userName ",
    "string.min": "the min length is 3 char",
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Email must be a valid email address",
      "string.pattern.base": "Email contains invalid characters",
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+|00)?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{6,14}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be valid and in African format",
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s$]).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (excluding $).",
      "string.empty": "Password cannot be empty.",
      "any.required": "Password is required.",
    }),

  role: Joi.string()
    .valid("buyer", "seller", "agent", "admin")
    .default("buyer"),
});

const loginValidation = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      "any.required": "email is required",
      "string.empty": "please enter your email ",
      "string.pattern.base": "Email contains invalid characters",
    }),
  password: Joi.string().required().min(8).messages({
    "string.empty": "please enter your password",
    "string.min": "password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

module.exports = { authValidation, loginValidation };
