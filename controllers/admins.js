const Joi = require('joi')
require("dotenv").config();
const { admins } = require('../models')
const jwt = require('../helpers/jwt')
const { encrypt, checkPass } = require("../helpers/bcrypt");
// const hbs = require("nodemailer-express-handlebars");
// const nodemailer = require("nodemailer");
// const path = require("path");

module.exports = {
  register: async (req, res) => {
    const body = req.body
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        full_name: Joi.string().required(),
        username: Joi.string().min(4).required(),
        password: Joi.string().min(6).max(12).required()
      })

      const check = schema.validate({
        email: body.email,
        full_name: body.full_name,
        username: body.username,
        password: body.password
      }, { abortEarly: false });

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"].map(({ message }) => message)
        })
      }

      //check email agar tidak double
      const checkEmail = await admins.findOne({
        where: {
          email: body.email,
        },
      });

      if (checkEmail) {
        return res.status(400).json({
          status: "failed",
          message: "Email already used, please use another email, or login",
          data: null,
        });
      }

      //check username agar tidak double
      const checkUsername = await admins.findOne({
        where: {
          username: body.username
        }
      })

      if (checkUsername) {
        return res.status(400).json({
          status: "fail",
          message: "Username already used, please use another username, or login",
        });
      }

      const admin = await admins.create({
        email: body.email,
        full_name: body.full_name,
        username: body.username,
        password: encrypt(body.password)

      });

      //encode data admin yang sedang dibuat agar langsung dapat token, supaya bisa langsung execute controller yg lain
      return res.status(200).json({
        status: "Success!",
        message: "Registered successfully!",
        
      });

    } catch (error) {
      return res.status(500).json({
        status: "Failed!",
        message: "Internal Server Error!",
        data: null
      });
    }
  },

  login: async (req, res) => {
    const body = req.body
    try {
      const schema = Joi.object({
        username: Joi.string().min(4).required(),
        password: Joi.string().min(6).max(12).required()
      })

      const check = schema.validate({ ...body }, { abortEarly: false });

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"].map(({ message }) => message)
        })
      }

      const admin = await admins.findOne({
        where: {
          username: body.username
        }
      })

      if (!admin) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid Username or Password",
          data: null
        });
      }

      const checkPassword = checkPass(body.password, admin.dataValues.password);

      if (!checkPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid Username or Password",
          data: null
        })
      }

      const payload = {
        username: admin.dataValues.username,
        id: admin.dataValues.id
      }

      //encode data yang sudah di login agar bisa get token
      const token = jwt.generateToken(payload)

      return res.status(200).json({
        status: "success",
        message: "Login successfully",
        token: token
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },

  /*forgotPassword: async (req, res) => {
    const body = req.body;
    try {
      const admin = await admins.findOne({
        where: {
          email: body.email,
        },
      });
      if (!admin) {
        return res.status(400).json({
          status: "failed",
          message: "This email does not exist.",
          data: null,
        });
      }
      const secret = process.env.SECRET + admin.password;
      const payload = {
        email: admin.dataValues.email,
        id: admin.dataValues.id,
      };
      const token = jwt.generateToken(payload, secret);
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };
      transporter.use("compile", hbs(handlebarOptions));
      let mailOptions = {
        from: process.env.EMAIL,
        to: `${admin.email}`,
        subject: "[WAREHOUSE-STOCK] Your Forgotton Password",
        template: "reset",
        context: {
          url: `https://api/v1/admin/reset-password/${admin.id}/${token}`,
        },
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return error;
        }
      });
      return res.status(200).json({
        msg: "Re-send the password, please check your email.",
      });
    } catch (err) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error"
      })
    }
  },
  resetPassword: async (req, res) => {
    const { id } = req.params;
    try {
      const { newPassword, confirmPassword } = req.body;
      const schema = Joi.object({
        newPassword: Joi.string().min(6).max(12).required(),
        confirmPassword: Joi.string().min(6).max(12).required(),
      });

      schema.validate(
        {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        { abortEarly: false }
      );

      //checking fields
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Please enter all fields.",
          data: null
        });
      }

      //checking matching password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Password Does Not Match.",
          data: null
        });
      }

      //checking password length
      const checkLength = newPassword.length;
      if (checkLength < 6) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be at least min 6 characters and max 12 characters.",
          data: null
        });
      } else if (checkLength > 12) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be at least min 6 characters and max 12 characters.",
          data: null
        });
      }

      const updatePassword = await admins.update(
        {
          newPassword: encrypt(newPassword),
          confirmPassword: encrypt(confirmPassword),
        },
        {
          where: { id: id },
        }
      );

      if (!updatePassword) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to input data",
          data: null
        });
      }

      const data = await admins.findOne({
        where: {
          id: id,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Password successfully changed!",
        data: data,
      });
      return res.redirect("/user/login");
    } catch (err) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error"
      })
    }
  },*/

  //Retriere data admin by id
  getOneAdmins: async (req, res) => {
    const id = req.params.id
    try {
      const adminsData = await admins.findOne({
        where: { id },
        attributes: { exclude: ["createdAt", "updatedAt", "password"] }
      });

      //check jika data admin yang dicari sesuai Id ada nilai nya atau tidak
      if (!adminsData) {
        return res.status(400).json({
          status: "failed",
          message: "Data not found"
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Succesfully retrieved data Admins",
        data: adminsData
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error"
      })
    }
  },

  //retrieve data admin keseluruhan
  getAllAdmins: async (req, res) => {
    try {
      const adminsData = await admins.findAll({
        attributes: { exclude: ["createdAt", "updatedAt", "password"] }
      });

      //check jika data admin sudah ada nilai/isi nya di table
      if (!adminsData) {
        return res.status(400).json({
          status: "failed",
          message: "Data not found"
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Succesfully retrieved data Admins",
        data: adminsData
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error"
      })
    }
  },

  //update Admin
  updateAdmin: async (req, res) => {
    const body = req.body;
    const id = req.params.id
    try {
      const schema = Joi.object({
        email: Joi.string(),
        full_name: Joi.string(),
        username: Joi.string(),
        password: Joi.string(),
      });

      const { error } = schema.validate({ ...body }, { abortEarly: false }
      );

      if (error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: error["details"].map(({ message }) => message),
        });
      }

      if (body.password) {
        const oldPass = await admins.findOne({
          where: {
            id
          },
        });

        const checkPassword = checkPass(
          body.password,
          oldPass.dataValues.password
        );

        if (checkPassword) {
          return res.status(400).json({
            status: "fail",
            message: "Password already used before, please use new password",
            data: null
          });
        }

        const hashedPassword = encrypt(body.password);

        await admins.update(
          { password: hashedPassword },
          { where: { id } }
        );
      }

      const adminUpdate = await admins.update(
        {
          email: body.email,
          full_name: body.full_name,
          username: body.username,
        },
        {
          where: { id },
        }
      );
      if (!adminUpdate) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to input data",
        });
      }

      const data = await admins.findOne({
        where: { id }
      })

      return res.status(200).json({
        status: "success",
        message: "Succesfully update the data",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
        data: null
      });
    }
  },

  //delete data admins
  deleteOneAdmins: async (req, res) => {
    const id = req.params.id
    try {
      const adminsData = await admins.destroy({ where: { id } });
      if (!adminsData) {
        return res.status(400).json({
          status: "failed",
          message: "Data not found"
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error"
      })
    }
  },
}