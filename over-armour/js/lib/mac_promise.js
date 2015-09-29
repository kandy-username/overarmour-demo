// Simple Modularized Promise for javascript
//
// Copyright (C) 2013 Macadamian Technologies
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Basic Useage
//
// define(["promise"],function(Promise)
// {
//   longProcess = function() {
//     var p = new Promise();
//     for(var i=0; i<100000; i++) {
//       //Do something long
//     }
//     p.resolve();
//     return p;
//   }
//   longProcess.then(function() {alert("Sucess");}, function() {alert("Failed"})});
// }
//
// Complete documentation available on Confluence
// https://partners.macadamian.com/confluence/display/KB/Documentation%3A+mac_promise

"use strict";

//Holds the various states for the promise
var State = {
    PENDING: "pending",
    REJECTED: "rejected",
    RESOLVED: "resolved"
};

function InnerPromise()
{
    this.state = State.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.callbacks = [];
    this.waitingForOnRejected = false;
}

//Creates the promise object

function Promise()
{
    var self = this ||
    {};
    var inner = new InnerPromise();

    //Sets the status of the promise to resolved and executes the onFullfilled callback
    self.resolve = function ()
    {
        var args = Array.prototype.slice.call(arguments, 0);

        if (inner.state !== State.PENDING)
        {
            //logger.warn("This promise has already been " + inner.state + ".");
            return;
        }
        inner.state = State.RESOLVED;
        inner.value = args;

        inner.changeState(State.RESOLVED);
        return this;
    };

    //Sets the status of the promise to rejected and executes the onRejected callback
    self.reject = function ()
    {
        var args = Array.prototype.slice.call(arguments, 0);

        if (inner.state !== State.PENDING)
        {
            //logger.warn("This promise has already been " + inner.state + ".");
            return;
        }
        inner.state = State.REJECTED;
        inner.reason = args;
        inner.changeState(State.REJECTED);
        return this;
    };

    //Calls the innerPromise .then() method
    self.then = function (onFullfilled, onRejected)
    {
        return inner.then(onFullfilled, onRejected);
    };

    //Returns a readOnly promise
    var promise = {
        "then": self.then,
        "resolve": function ()
        {
            //logger.warn("This promise is in read-only mode, you cannot resolve it.");
        },
        "reject": function ()
        {
            //logger.warn("This promise is in read-only mode, you cannot reject it.");
        }
    };
    promise.promise = promise;
    self.promise = promise;

    return self;
}

//The fail method of the promise is a .then method without a onFullfilled argument
Promise.prototype.fail = function (onRejected)
{
    return this.then(undefined, onRejected);
};

//Returns the read only promise (cannot be resolved or rejected)
Promise.prototype.readOnly = function ()
{
    return this.promise;
};

//Changes the state of the promise and calls the appropriate callback
InnerPromise.prototype.changeState = function changeState(state)
{
    var cb = this.callbacks;
    this.callbacks = [];

    var self = this;
    //Check if this is a rejection and there is no callbacks after this
    if (state === State.REJECTED && cb[0] === undefined)
    {
        this.waitingForOnRejected = true;
        //Check if this promise is still unresolved in 5 seconds
        var timeoutSelf = this;
        setTimeout(function ()
        {
            if (self.waitingForOnRejected)
            {
                //logger.warn("A error occured in one of your promises but no onRejected function was found.  "+ timeoutSelf.reason, timeoutSelf.reason);
            }
        }, 5000);
    }

    for (var i = 0; i < cb.length; i++)
    {
        if (state === State.RESOLVED)
        {
            if (typeof cb[i][State.RESOLVED] === "function")
            {
                this.executeCallback(cb[i][State.RESOLVED], cb[i].nextPromise, this.value);
            }
            else
            {
                var tempPromise = cb[i].nextPromise;
                tempPromise.resolve.apply(tempPromise, this.value);
            }
        }
        else
        {
            if (typeof cb[i][State.REJECTED] === "function")
            {
                this.executeCallback(cb[i][State.REJECTED], cb[i].nextPromise, this.reason);
            }
            else
            {
                var tempPromise = cb[i].nextPromise;
                tempPromise.reject.apply(tempPromise, this.reason);
            }
        }
    }

};

//Prepares a list of callback functions
InnerPromise.prototype.then = function then(onFullfilled, onRejected)
{
    //If the inner promise was waiting for a onRejected and we have one,
    //cancel the error message
    if (onRejected !== undefined && this.waitingForOnRejected)
    {
        this.waitingForOnRejected = false;
    }

    //If onFulfilled/onRejected is not a function, it must be ignored
    if (typeof onFullfilled !== "function" && onFullfilled !== undefined)
    {
        //logger.warn("onFullfilled argument must be a function");
        onFullfilled = undefined;
    }
    if (typeof onRejected !== "function" && onRejected !== undefined)
    {
        //logger.warn("onRejected argument must be a function");
        onRejected = undefined;
    }

    var thenPromise = new Promise();
    var self = this;

    switch (this.state)
    {
    case State.PENDING:
        //Add the callbacks and the next promise to the inner promise
        var callbacksStore = {};
        callbacksStore[State.RESOLVED] = onFullfilled;
        callbacksStore[State.REJECTED] = onRejected;
        callbacksStore.nextPromise = thenPromise;
        this.callbacks.push(callbacksStore);
        break;
    case State.RESOLVED:
        //If the promise was already resolved, return the new promise then execute
        // the callback (after the timeout)
        if (typeof onFullfilled === "function")
        {
            setTimeout(function ()
            {
                self.executeCallback(onFullfilled, thenPromise, self.value);
            }, 1);
        }
        else
        {
            thenPromise.resolve.apply(thenPromise, this.value);
        }
        break;
    case State.REJECTED:
        //If the promise was already rejected, return the new promise then
        // execute the callback (after the timeout)
        if (typeof onRejected === "function")
        {
            setTimeout(function ()
            {
                self.executeCallback(onRejected, thenPromise, self.reason);
            }, 1);
        }
        else
        {
            thenPromise.reject.apply(thenPromise, this.reason);
        }
        break;
    }

    return thenPromise;
};

//This function executes a callback
InnerPromise.prototype.executeCallback = function (callback, innerPromise, previousArguments)
{
    try
    {
        var result = callback.apply(null, previousArguments);
        //Check if the returns object is another promise
        if (result && typeof result.then === "function")
        {
            result.then(function ()
            {
                var args = Array.prototype.slice.call(arguments, 0);
                innerPromise.resolve.apply(innerPromise, args);
            }, function ()
            {
                var args = Array.prototype.slice.call(arguments, 0);
                innerPromise.reject.apply(innerPromise, args);
            });
        }
        else
        {
            innerPromise.resolve(result);
        }
    }
    //If an error occurs in the callback, reject the promise
    catch (reason)
    {
        innerPromise.reject(reason);
    }

    return innerPromise;
};

Promise.when = function ()
{
    var args = Array.prototype.slice.call(arguments, 0);
    var promise;
    if (args.length === 1 && args[0].length)
    {
        promise = Promise.when.apply(this, args[0]);
    }
    else
    {
        var count = args.length;
        var results = [];
        promise = new Promise();
        var done = function (index)
        {
            return function (value)
            {
                results[index] = value;
                count--;
                if (count === 0)
                {
                    promise.resolve.apply(null, results);
                }
            };
        };
        for (var i = 0; i < args.length; i++)
        {
            args[i].then(done(i), promise.reject);
        }
    }
    return promise;
};