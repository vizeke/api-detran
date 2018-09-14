const soap = require('soap-as-promised');
const detran = require('../config/detran');
const app = require('../config/app');

module.exports = soap.createClient(detran.debitsWS.serviceUrl).then(client => {
  client.addSoapHeader(
    {
      SegurancaDetran: {
        Usuario: detran.debitsWS.user,
        Senha: detran.debitsWS.password
      }
    },
    undefined,
    '__tns__',
    'http://tempuri.org/'
  );
  return client;
});
