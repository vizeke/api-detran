const vehicleService = require('../services/vehicleService');
const vehicleDebitService = require('../services/vehicleService');

function vehicleNotFound(next) {
  const error = new Error('Veículo não encontrado.');
  error.userMessage = error.message;
  error.handled = true;
  error.status = 404;
  next(error);
}

module.exports = () => {
  var vehicleController = new Object();

  vehicleController.getData = (req, res, next) => {
    const plate = req.query.plate;
    const renavam = req.query.renavam;

    return vehicleService()
      .getDadosVeiculo(plate, renavam)
      .then(response => {
        const data = response.ObterDadosVeiculoResult;
        if (data.MensagemErro) {
          vehicleNotFound(next);
          return;
        }

        return res.json({
          model: data.VeiculoInfo.MarcaModelo.trim(),
          color: data.VeiculoInfo.Cor,
          year: data.VeiculoInfo.AnoFabricacao.trim(),
          owner: data.VeiculoInfo.Nome.trim()
        });
      })
      .catch(next);
  };

  vehicleController.getDataDB = (req, res, next) => {
    const plate = req.query.plate;
    const renavam = req.query.renavam;

    return vehicleService()
      .getDadosVeiculoDB(plate, renavam)
      .then(data => {
        if (!data.MARCA) {
          vehicleNotFound(next);
          return;
        }

        return res.json({
          model: data.MARCA.trim(),
          color: data.COR.trim()
        });
      })
      .catch(next);
  };

  vehicleController.getTickets = (req, res, next) => {
    const plate = req.query.plate;
    const renavam = req.query.renavam;

    return vehicleService()
      .getTickets(plate, renavam)
      .then(data => {
        // TODO: Find better way to do this
        // Check for vehicle not found
        if (data.length === 1 && !data[0].DataHoraAutuacao) {
          vehicleNotFound(next);
          return;
        }

        const resp = data
          .map(a => {
            return {
              description: a.DescricaoInfracao.trim(),
              classification: a.Natureza.trim(),
              points: +a.Pontos,
              place: a.LocalInfracao.trim(),
              district: a.NomeCidadeInfracao.trim(),
              date: a.DataHoraAutuacao
            };
          })
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        return res.json(resp);
      })
      .catch(next);
  };

  vehicleController.getDebits = (req, res, next) => {
    const plate = req.query.plate;

    return vehicleDebitService()
      .getDebits(plate)
      .then(data => res.json(data.ObterDebitosResult))
      .catch(err => next(err));
  };

  vehicleController.getInvoice = (req, res, next) => {
    const plate = req.query.plate;
    const debitoIds = req.query.debitoIds;
    const pdf = req.query.pdf || false;

    return vehicleDebitService()
      .getInvoice(plate, debitoIds)
      .then(data => {
        if (pdf) {
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=guia-detran.pdf`
          });
          return res.end(Buffer.from(data.GerarGuiaResult.GuiaPDF.toString('utf-8'), 'base64'));
        } else {
          return res.json(data.GerarGuiaResult.Guia);
        }
      })
      .catch(next);
  };

  return vehicleController;
};
