"use strict";
/**
* Test for RPIO class
*
* @license     MIT
*
* @author      Jason Hillier <jason@hillier.us>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;
var libAsync = require('async');

var _Fable = require('fable').new(
{
	Product: 'rpio-webservices',
	ProductVersion: '1.0.0',

	ConfigFile: __dirname + "/Example-Settings.json"
});

suite
(
	'RPIO Abstraction',
	function()
	{
        let _libRPIO;

        suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'initialize should build a happy little object',
					function()
					{
                        _libRPIO = new (require(__dirname + '/../source/rpio.js'))(_Fable);

						Expect(_libRPIO).to.be.an('object', '_libRPIO should initialize as an object directly from the require statement.');
					}
				);
			}
		);
        suite
		(
			'Sensor data test',
			function()
			{
				let tmpSensorList;

				test
				(
                    'Print sensor names from config',
                    function()
                    {
                        _libRPIO.print();
                    }
                );
				test
				(
                    'Enumerate sensors IDs',
                    function()
                    {
						tmpSensorList = _libRPIO.list;
                        console.log(tmpSensorList);
                    }
                );
				test
				(
                    'Read each sensor',
                    function(fDone)
                    {
						libAsync.eachSeries(tmpSensorList, function(sensorId, fNext)
						{
							_libRPIO.read(sensorId, function(pError, pValue)
							{
								console.log(pValue);
								return fNext();
							});
						}, fDone);
                    }
                );
            }
        );
    }
);
