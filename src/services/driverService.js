const sql = require('mssql');
const detran = require('../config/detran');

const SP_DADOS_CNH = detran.sit.SPDadosCNH;
const SP_INFRACOES = detran.sit.SPInfracoes;
const SP_DADOS_CONDUTOR = detran.sit.SPDadosCondutor;
const config = detran.sit.sqlConnectionConfig;

module.exports = () => {
  const sitService = new Object();
  const connection = new sql.Connection(config);

  sitService.getDadosGeraisCNH = (cpf, cnh, ballot) => {
    return connection
      .connect()
      .then(conn => {
        return new sql.Request(conn)
          .input('CPF', sql.Numeric, cpf)
          .input('NumRegistroCNH', sql.Numeric, cnh)
          .input('NumCedula', sql.Numeric, ballot)
          .execute(SP_DADOS_CNH);
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

  sitService.getInfracoes = (cpf, cnh, ballot) => {
    return connection
      .connect()
      .then(conn => {
        return new sql.Request(conn)
          .input('numCPF', sql.Numeric, cpf)
          .input('NumRegistroCNH', sql.Numeric, cnh)
          .input('NumCedula', sql.Numeric, ballot)
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

  sitService.getDadosCondutor = cpf => {
    return connection
      .connect()
      .then(conn => {
        return new sql.Request(conn)
          .input('numCPF', sql.Numeric, cpf)
          .execute(SP_DADOS_CONDUTOR);
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

  return sitService;
};
