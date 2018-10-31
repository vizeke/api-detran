const driverService = require('../services/driverService');

module.exports = () => {
  var driverController = new Object();

  driverController.getData = (req, res, next) => {
    return driverService()
      .getDadosGeraisCNH(
        req.userInfo.cpf,
        req.userInfo.cnhNumero,
        req.userInfo.cnhCedula
      )
      .then(data => {
        return res.json({
          status: +data.SituacaoCNH,
          blockMotive: data.MotivoBloqueio,
          expirationDate: data.DataVencimento,
          hasTickets: data.ExistemInfracoesPontuadas === 'true',
          acquiringLicense: data.ExisteProcessoHabilitacaoAberto === 'true',
          hasAdministrativeIssues: data.ExisteProcessoAdmAberto === 'true'
        });
      })
      .catch(err => {
        if (err.number === 999999) {
          err.status = 404;
          err.userMessage = err.message;
          err.handled = true;
        }
        next(err);
      });
  };

  driverController.getTickets = (req, res, next) => {
    return driverService()
      .getInfracoes(
        req.userInfo.cpf,
        req.userInfo.cnhNumero,
        req.userInfo.cnhCedula
      )
      .then(data => {
        const resp = data
          .map(a => {
            return {
              description: a.DescTipoInfracao.trim(),
              classification: a.DescClassificacaoInfracao.trim(),
              points: +a.Pontuacao,
              place: a.localinfracao.trim(),
              district: a.municipioinfracao.trim(),
              date: a.datahora,
              plate: a.placa,
              warning: a.Advertencia === 'true'
            };
          })
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        return res.json(resp);
      })
      .catch(err => {
        if (err.number === 99999) {
          err.status = 404;
          err.userMessage = err.message;
          err.handled = true;
        }
        next(err);
      });
  };

  driverController.getDadosCondutor = (req, res, next) => {
    return driverService()
      .getDadosCondutor(req.params.cpf)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        next(err);
      });
  };

  return driverController;
};
