const User = require('./users.model');
const bcrypt = require('bcrypt');
const {generateToken} = require('../../utils/jwt/jwt.js');
const nodemailer = require("nodemailer");
const {generateID} = require("../../utils/generateID/generateID.js")





const register = async (req, res, next) => {
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true, // true for 465, false for other ports
    //     auth: {
    //       user: "cfarrioltypsa@gmail.com", // generated ethereal user
    //       pass: "tzchujenrpeiagsv", // generated ethereal password
    //     },
    //   });
    try {
        const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,12}$/;

        const {name, email, surname, password, parametro} = req.body
        if(name === ""|| email === "" || surname === ""){
            return res.json("¡No puedes dejar campos vacios!")
        }
        if(password.length < 8){
            return res.json("¡La contraseña es demasiado corta!")
        }
        if(!regexp.test(password)){
            return res.json("¡El password no cumple con los requisitos minimos de seguridad!. Recuerda que debe tener de 8 a 12 caracteres y que debe incluir minimo: Un caracter en mayúscula, uno en minúscula, un número y un carácter especial")
        }
        

        const user = new User();
        user.name = name;
        user.email = email;
        user.surname = surname;
        user.password = password;
        user.token = generateID();
        // Miramos si el email existea
        const userExist = await User.findOne({ email: user.email })
        if (userExist) {
            // TODO: Errores
            const error = new Error("¡El correo ya existe, puedes solicitar crear una nueva contraseña si la has olvidado!");
            return res.json({msg: error.message})
        }
        const userDB = await user.save();

        // let info = await transporter.sendMail({
        //     from: '"Cristian Farriol 👻" <cfarriol@typsa.es>', // sender address
        //     to: `${req.body.email}`, // list of receivers
        //     subject: "Enviado desde nodemailer ✔", // Subject line
        //     text: "Hello world?", // plain text body
        //     html: `<b>Bienvenido a dLab! ${req.body.name}, solo te queda un paso por realizar, pincha en el siguiente enláce para completar tu registro: ${parametro}user-confirm/${user.token} </b>`, // html body
        //   });
        return res.status(201).json(userDB)

    } catch (error) {
        const err = new Error("Ha ocurrido un error con el registro.");
        return res.status(404).json({msg: err.message})
    }
}

const confirm = async (req, res, next) => {

    const {token} = req.params;
    const userConfirm = await User.findOne({token})
    if (!userConfirm){
        const error = new Error("Token no valido")
        return res.status(403).json({msg: error.message})
    }

    try {
        userConfirm.confirmed = true;
        userConfirm.token = "";
        await userConfirm.save()
        return res.status(200).json({msg: "¡Usuario Confirmado!"})
    } catch (error) {
        console.log(error)
    }
}

const login = async (req, res, next) => {

    try {
        // Comprobamos que existe el email para logarse
        const user = await User.findOne({ email: req.body.email });

        if(!await user.passwordCheck(req.body.password)){
            const error = new Error("El correo electronico o la contraseña no son correctos, revisalos e intenta nuevamente");
            return res.json({msg: error.message})
        }

        if (!user.confirmed){
            const error = new Error("¡Aun no has confirmado tu cuenta!");
            return res.json({msg: error.message})
        }
        if (await user.passwordCheck(req.body.password)) {
                 // Generamos el Token
            const token = generateToken(user._id, user.email);
            user.token = token;
            await user.save()
            // Devolvemos el Token al Frontal
            return res.json(user);
        } else {
            const error = new Error("El correo electronico o la contraseña no son correctos, revisalos e intenta nuevamente");
            return res.json({msg: error.message})
        }
           

    } catch (error) {
        const err = new Error("Ha ocurrido un error con el inicio de sesión.");
        return res.json({msg: err.message})
    }
}

const logout = async (req, res, next) => {
    const {token} = req.params;
    const userConfirm = await User.findOne({token})
    try {
        // Te elimina el token -> Es decir te lo devuelve en null
        const token = null;
        userConfirm.token = "";
        await userConfirm.save()
        return res.status(201).json(userConfirm.token)
    } catch (error) {
        return next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true, // true for 465, false for other ports
    //     auth: {
    //       user: "cfarrioltypsa@gmail.com", // generated ethereal user
    //       pass: "tzchujenrpeiagsv", // generated ethereal password
    //     },
    //   });
    const {email, parametro} = req.body;
    
        const user = await User.findOne({ email });
        
    
        if (!user) {
            const error = new Error("El usuario no existe");
            return res.status(404).json({msg: error.message})
        }

    try {
        user.token = generateID()
        await user.save()
        // let info = await transporter.sendMail({
        //     from: '"Cristian Farriol 👻" <cfarriol@typsa.es>', // sender address
        //     to: `${user.email}`, // list of receivers
        //     subject: "Recupera tu password ✔", // Subject line
        //     text: "Hola!", // plain text body
        //     html: `<b>Hola, has solicitado reestablecer tu password, pincha en el siguiente enláce para elegir tu nueva contraseña: ${parametro}recover-password/${user.token} </b>`, // html body
        //   });
        res.json(user)
    } catch (error) {
        console.log(error)
    }

}


const verifyToken = async (req, res, next) => {

    const {token} = req.params;
    console.log(token)
const tokenValido = await User.findOne({token})
if (tokenValido){
    return res.json(tokenValido)
} else {
    const error = new Error("El Token no es valido");
    return res.json({msg: error.message})
}

}

const verifyAdminByEmail = async (req, res, next) => {

    const {token} = req.params;
    const email = token
    try {
        const user = await User.findOne({email})
        res.json(user)
    } catch (error) {
        res.json("No tienes permiso para entrar en esta Area")
    }
    

}

const newPassword = async (req, res, next) => {

    const {token} = req.params;
    const {password} = req.body;
    
    const user = await User.findOne({token})
    
    if (user){
        user.password = password;
        user.token = "";
        await user.save();
        res.json({msg: "Contraseña actualizada correctamente"})
    }else {
        const error = new Error("El Token no es valido");
        return res.status(404).json({msg: error.message})
    }

    try {
        
    } catch (error) {
        
    }
}


module.exports = { register, login, logout, confirm, forgotPassword, verifyToken, newPassword, verifyAdminByEmail }