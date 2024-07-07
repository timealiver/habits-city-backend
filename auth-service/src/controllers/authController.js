const User = require('../models/User.js')
const Role = require('../models/Role.js') 
class authController {
    async registration(req,res){
        try {
            
        } catch (e) {
            
        }
    }
    async login(req,res){
        try {
            
        } catch (e) {
            
        }
    }
    async getUsers(req,res){
        try {
            const userRole=new Role()
            const adminRole=new Role({value: "ADMIN"})
            await userRole.save()
            await adminRole.save()
            res.json("res work")
        } catch (e) {
            
        }
    }
}

module.exports = new authController();