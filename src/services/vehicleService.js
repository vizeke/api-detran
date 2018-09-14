const sql = require('mssql');
const detran = require('../config/detran');
const detranSoapClient = require('../repositories/detranSoap');

const SP_DADOS_VEICULO = detran.detranNet.SPDadosVeiculo;
const SP_INFRACOES = detran.detranNet.SPInfracoes;
const config = detran.detranNet.sqlConnectionConfig;

console.log(config);

module.exports = () => {
  const vehicleService = new Object();
  const connection = new sql.Connection(config);

  vehicleService.getDebits = plate => {
    if (plate == null) {
      throw { message: 'parâmetros inválidos', status: 400 };
    }

    const veiculo = {
      veiculoConsulta: {
        Placa: plate
      }
    };

    return detranSoapClient.then(client => client.ObterDebitos(veiculo));
  };

  vehicleService.getInvoice = (plate, debitoIds) => {
    if (plate == null || debitoIds == null) {
      throw { message: 'parâmetros inválidos', status: 400 };
    }

    const veiculo = {
      veiculoConsulta: {
        Placa: plate
      },
      listaDebitos: debitoIds
    };

    return detranSoapClient.then(client => client.GerarGuia(veiculo));
  };

  vehicleService.getDadosVeiculo = (plate, renavam) => {
    const veiculo = {
      veiculoConsulta: {
        Placa: plate,
        Renavam: renavam
      }
    };

    return detranSoapClient.then(client => client.ObterDadosVeiculo(veiculo));
  };

  vehicleService.getTickets = function(plate, renavam) {
    return connection
      .connect()
      .then(conn => {
        return new sql.Request(conn)
          .input('placa', sql.VarChar(10), plate)
          .input('renavam', sql.BigInt, renavam)
          .execute(SP_INFRACOES);
      })
      .then(recordsets => {
        connection.close();
        return recordsets[0];
      })
      .catch(err => {
        connection.close();
        return Promise.reject(err);
      });
  };

  vehicleService.getDadosVeiculoDB = function(plate, renavam) {
    return connection
      .connect()
      .then(conn => {
        return new sql.Request(conn)
          .input('placa', sql.VarChar(10), plate)
          .input('renavam', sql.BigInt, renavam)
          .execute(SP_DADOS_VEICULO);
      })
      .then(recordsets => {
        connection.close();
        return recordsets[0][0];
      })
      .catch(err => {
        connection.close();
        return Promise.reject(err);
      });
  };

  return vehicleService;
};
