import "dotenv/config";
import express from "express";
import pg from "pg";
import Joi from "joi";

const app = express()
const port = process.env.PORT
const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware Logging
app.use((req, res, next) => {
  console.start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log({
      metod: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    })
  })
  next()
})

// Response Envlope
function successResponse(res, message, data, status = 200){
  return res.status(status).json({
    success: true, message, data, error: null,
  })
}

function errorResponse(res, message, status, details = null){
  return res.status(status).json({
    success: false, message, data: null, error: details,
  })
}

// Joi Validation Schema
const diodataSchema = Joi.object({
  id: Joi.number().integer().positive(),
  nama: Joi.string().trim().min(2).max(100).required(),
  nim: Joi.string().trim().min(5).max(20).required(),
  kelas: Joi.string().trim().min(1).max(20).required(),
})

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

// Middleware untuk Validation body
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, convert: true, allowUnknown: false
    })

    if (error) {
      return errorResponse(
        res, 
        'Validasi Input Gagal', 
        400, 
        error.details.map(item =>({
          field: item.path.join('.'),
          message: item.message
        }))
      )
    }

    req.body = value,
    next()
  }
}

// Middleware untuk Validation parameter id
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params)

    if (error) {
      return errorResponse(
        res, 
        'Paramaeter ID Tidak Valid', 
        400, 
        error.details.map(item =>({
          field: item.path.join('.'),
          message: item.message
        }))
      )
    }

    req.params = value,
    next()
  }
}