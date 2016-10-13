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
var libSuperTest = require('supertest');

var FableSettings = (
{
	Product: 'rpio-webservices',
	ProductVersion: '1.0.0',

	ConfigFile: __dirname + "/Example-Settings.json"
});

suite
(
	'WebService',
	function()
	{
        let _Orator = null;

        suite
		(
			'Initialize Web Server',
			function()
			{
				test
				(
					'setup orator web server',
					function()
					{
                        _Orator = require('orator').new(FableSettings);
                        _Orator.enabledModules.CORS = true;
                        _Orator.enabledModules.FullResponse = true;
                        _Orator.enabledModules.Body = false;
					}
				);
                test
                (
                    'initialize rpio-webservice',
                    function()
                    {
                        let libRPIOWebService = new (require(__dirname + '/../source/webservice.js'))(_Orator);
                    }
                );
                test
                (
                    'start web server',
                    function(fDone)
                    {
                        _Orator.startWebServer(fDone);
                    }
                );
			}
		);
        suite
        (
            'Test WebService Endpoints',
            function()
            {
                test
                (
                    'get list of available sensors from server',
                    function(fDone)
                    {
                        libSuperTest('http://localhost:8080/')
						.get('/Sensors')
						.end(
							function(pError, pResponse)
							{
                                console.log(pResponse.body);
                                Expect(pResponse.body).to.have.property('red-button');

                                return fDone();
                            });
                    }
                );
                test
                (
                    'read value of a sensor from the server',
                    function(fDone)
                    {
                        libSuperTest('http://localhost:8080/')
						.get('/Sensor/red-button/Value')
						.end(
							function(pError, pResponse)
							{
                                console.log(pResponse.body);
                                Expect(pResponse.body).to.have.property('Value');

                                return fDone();
                            });
                    }
                );
            }
        );
    }
);
