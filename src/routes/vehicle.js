module.exports = app => {

    const vehicleController = require( '../controllers/vehicleController' )();

    app.get( '/vehicle', vehicleController.getDataDB );
    
    app.get( '/vehicle2', vehicleController.getData );

    app.get( '/vehicle/tickets', vehicleController.getTickets );

    app.get( '/vehicle/debits', vehicleController.getDebits );

    app.get( '/vehicle/invoice', vehicleController.getInvoice );
};
