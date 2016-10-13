"use strict";
/**
* WebService class for I/O abstraction library
*
* @license     MIT
*
* @author      Jason Hillier <jason@hillier.us>
*/

class RPIOWebService
{
    constructor(pOrator)
    {
        this._Fable = pOrator;
        this._Log = this._Fable.log;
        this._RPIOSensors = new (require(__dirname+'/rpio.js'))(pOrator.fable);

        if (pOrator.webServer)
        {
            this.connectRoutes(pOrator.webServer);
        }
    }

    connectRoutes(pRestServer)
    {
        pRestServer.get('/Sensors', this.getSensorDetails.bind(this));
        pRestServer.get('/Sensor/:SensorID/Value', this.getSensorValue.bind(this));

        //TODO: wire-up a websocket so we can push sensor state changes
    }

    //Enumerate sensor configuration
    getSensorDetails(pRequest, pResponse, fCallback)
    {
        this._Log.trace('Sending sensor details...');

        pResponse.send(this._RPIOSensors.detail);
        pResponse.end();

        return fCallback();
    }

    //Read current value of sensor
    getSensorValue(pRequest, pResponse, fCallback)
    {
        if (!pRequest.params.SensorID)
        {
            pResponse.send({Error: 'Invalid sensor ID!'});
            pResponse.end();
            return fCallback();
        }
        else
        {
            this._RPIOSensors.read(pRequest.params.SensorID, function(pError, pValue)
            {
                pResponse.send({Value: pValue});
                pResponse.end();
                return fCallback();
            });
        }
    }
}

module.exports = RPIOWebService;
