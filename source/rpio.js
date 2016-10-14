"use strict";
/**
* Raspberry Pi I/O Abstraction class
*
* @license     MIT
*
* @author      Jason Hillier <jason@hillier.us>
*/

let libGPIO = null;
let libMcp3008 = null;
let _ADC = null;

try
{
    libGPIO = require('rpio');
    libMcp3008 = require('mcp3008.js');
    _ADC = new libMcp3008();
}
catch(ex)
{
    console.warn('Library load warning:', ex);
}

class RPIO
{
    constructor(pFable)
    {
        this._Fable = pFable;
        this._Log = this._Fable.log;

        if (!this._Fable.settings.Sensors)
            throw new Error('Settings file missing Sensors property!');

        this._Sensors = this._Fable.settings.Sensors;
        this._Channels = {}; //holds connection state for each sensor
    }

    //Print the full display name of each sensor from the configuration
    print()
    {
        let self = this;
        let tmpSensorList = this.list;

        tmpSensorList.forEach(function(sensor)
        {
            console.log(self._Sensors[sensor].displayName);
        });
    }

    //Return an array of sensor hash names from the configuration
    get list()
    {
        return Object.keys(this._Sensors);
    }

    //Return the full sensor configuration
    get detail()
    {
        return this._Sensors;
    }

    //Return the current value of a sensor
    read(pSensorId, fCallback)
    {
        let tmpSensor = this._Sensors[pSensorId];
        if (!tmpSensor)
            return fCallback('Sensor not found!');
        if (!tmpSensor.range)
            return fCallback('Sensor missing range definition!');

        tmpSensor.sensorId = pSensorId;

        return this[`_read_${tmpSensor.type}`](tmpSensor, fCallback);
    }

    //Handler for 'pseudo' sensor.  Useful for testing away from Raspberry Pi
    _read_pseudo(pSensor, fCallback)
    {
        let min = 0, max = 1;

        if (Array.isArray(pSensor.range) &&
            pSensor.range.length === 2)
        {
            min = pSensor.range[0];
            max = pSensor.range[1];
        }
        
        let result = Math.random() * (max - min) + min;
        if (min === 0 && max === 1)
            result = Math.round(result);

        return fCallback(null, result);
    }

    //Handler for GPIO sensor
    _read_gpio(pSensor, fCallback)
    {
        if (!pSensor.pin)
            return fCallback('Sensor missing GPIO pin definition!');
        
        //check if channel open
        if (!this._Channels[pSensor.sensorId])
        {
            //open a channel
            libGPIO.open(pSensor.pin, libGPIO.INPUT); //TODO: error handling
            this._Channels[pSensor.sensorId] = {pin: pSensor.pin, mode: libGPIO.INPUT};
        }

        //read data from pin
        let result = libGPIO.read(pSensor.pin);

        return fCallback(null, result);
    }

    //Handler for analog sensor attached to mcp3008 via SPI
    _read_mcp3008(pSensor, fCallback)
    {
        if (!pSensor.channel)
            return fCallback('Sensor missing Mcp3008 channel definition!');

        //TODO: sensor calibration methods

        _ADC.read(pSensor.channel, function(value)
        {
            return fCallback(null, value);
        });
    }
}

module.exports = RPIO;
