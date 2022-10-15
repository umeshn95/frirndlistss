var server = require('server')

server.get('Show',(req,res,next)=>{
    if(customer.isAuthenticated()){

    }
    else{
        res.render('nologfriend')

    }
    next();
});

module.exports = server.exports();