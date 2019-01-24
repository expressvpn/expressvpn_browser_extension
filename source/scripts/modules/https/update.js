/*
HTTPS Everywhere:
Copyright © 2010-2018 Electronic Frontier Foundation and others
Licensed GPL v2+

HTTPS Everywhere Rulesets (src/chrome/content/rules):
To the extent copyright applies to the rulesets, they can be used according to GPL v2 or later.

This file was modified by Express VPN International Ltd on May 16th, 2018
*/

/* global update_channels */
/* global pako */
/* global __dirname */
const util = require('./util');
const pako = require('pako');

"use strict";

var update_channels = [{
  name: "EFF (Full)",
  jwk: {
    kty: "RSA",
    e: "AQAB",
    n: "1cwvFQu3Kw-Pz8bcEFuV5zx0ZheDsc4Tva7Qv6BL90_sDLqCW79Y543nDkPtNVfFH_89pt2kSPp_IcS5XnYiw6zBQeFuILFw5JpvZt14K0s4e025Q9CXfhYKIBKT9PnqihwAacjMa6rQb7RTu7XxVvqxRb3b0vx2CR40LSlYZ8H_KpeaUwq2oz-fyrI6LFTeYvbO3ZuLKeK5xV1a32xeTVMFkIj3LxnQalxq-DRHfj7LRRoTnbRDW4uoDc8aVpLFliuO79jUKbobz4slpiWJ4wjKR_O6OK13HbZUiOSxi8Bms-UqBPOyzbMVpmA7lv_zWdaLu1IVlVXQyLVbbrqI6llRqfHdcJoEl-eC48AofuB-relQtjTEK_hyBf7sPwrbqAarjRjlyEx6Qy5gTXyxM9attfNAeupYR6jm8LKm6TFpfWkyDxUmj_f5pJMBWNTomV74f8iQ2M18_KWMUDCOf80tR0t21Q1iCWdvA3K_KJn05tTLyumlwwlQijMqRkYuao-CX9L3DJIaB3VPYPTSIPUr7oi16agsuamOyiOtlZiRpEvoNg2ksJMZtwnj5xhBQydkdhMW2ZpHDzcLuZlhJYZL_l3_7wuzRM7vpyA9obP92CpZRFJErGZmFxJC93I4U9-0B0wg-sbyMKGJ5j1BWTnibCklDXtWzXtuiz18EgE"
  },
  update_path_prefix: "https://www.https-rulesets.org/v1/"
}];

(function(exports) {


let store,
  background_callback;

// how often we should check for new rulesets
let periodicity = 86400; // every day (in seconds)

//"Minimal" change compliant patch
chrome.storage.onChanged.addListener(async function(changes, areaName) {
  //console.log("changes", changes);
  if (changes.prefs) {
    if (changes.prefs.oldValue && changes.prefs.newValue.httpsPeriodicity !== changes.prefs.oldValue.httpsPeriodicity) {
      periodicity = parseInt(changes.prefs.newValue.httpsPeriodicity, 10);
      destroyTimer();
      createTimer();
    }
  }
});

// jwk key loaded from keys.js
let imported_keys = {};
for(let update_channel of update_channels){
  imported_keys[update_channel.name] = window.crypto.subtle.importKey(
    "jwk",
    update_channel.jwk,
    {
      name: "RSA-PSS",
      hash: {name: "SHA-256"},
    },
    false,
    ["verify"]
  );
}

// Determine the time until we should check for new rulesets
async function timeToNextCheck() {
  const last_checked = await store.local.get_promise('last-checked', false);
  if(last_checked) {
    const current_timestamp = Date.now() / 1000;
    const secs_since_last_checked = current_timestamp - last_checked;
    return Math.max(0, periodicity - secs_since_last_checked);
  } else {
    return 0;
  }
}

// Check for new rulesets. If found, return the timestamp. If not, return false
async function checkForNewRulesets(update_channel) {
  let timestamp_result = await fetch(update_channel.update_path_prefix + "/latest-rulesets-timestamp");
  if(timestamp_result.status == 200) {
    let rulesets_timestamp = Number(await timestamp_result.text());
    if((await store.local.get_promise('rulesets-timestamp: ' + update_channel.name, 0)) < rulesets_timestamp){
      return rulesets_timestamp;
    }
  }
  return false;
}

// Retrieve the timestamp for when a stored ruleset bundle was published
async function getRulesetTimestamps(){
  let timestamp_promises = [];
  for(let update_channel of update_channels){
    timestamp_promises.push(new Promise(async resolve => {
      let timestamp = await store.local.get_promise('rulesets-stored-timestamp: ' + update_channel.name, 0);
      resolve([update_channel.name, timestamp]);
    }));
  }
  let timestamps = await Promise.all(timestamp_promises);
  return timestamps;
}

// Download and return new rulesets
async function getNewRulesets(rulesets_timestamp, update_channel) {

  store.local.set_promise('rulesets-timestamp: ' + update_channel.name, rulesets_timestamp);

  let signature_promise = fetch(update_channel.update_path_prefix + "/rulesets-signature." + rulesets_timestamp + ".sha256");
  let rulesets_promise = fetch(update_channel.update_path_prefix + "/default.rulesets." + rulesets_timestamp + ".gz");

  let responses = await Promise.all([
    signature_promise,
    rulesets_promise
  ]);

  let resolutions = await Promise.all([
    responses[0].arrayBuffer(),
    responses[1].arrayBuffer()
  ]);

  return {
    signature_array_buffer: resolutions[0],
    rulesets_array_buffer: resolutions[1]
  };
}

// Returns a promise which verifies that the rulesets have a valid EFF
// signature, and if so, stores them and returns true.
// Otherwise, it throws an exception.
function verifyAndStoreNewRulesets(new_rulesets, rulesets_timestamp, update_channel){
  return new Promise((resolve, reject) => {
    imported_keys[update_channel.name].then(publicKey => {
      window.crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32
        },
        publicKey,
        new_rulesets.signature_array_buffer,
        new_rulesets.rulesets_array_buffer
      ).then(async isvalid => {
        if(isvalid) {
          util.log(util.NOTE, update_channel.name + ': Downloaded ruleset signature checks out.  Storing rulesets.');

          const rulesets_gz = util.ArrayBufferToString(new_rulesets.rulesets_array_buffer);
          const rulesets_byte_array = pako.inflate(rulesets_gz);
          const rulesets = new TextDecoder("utf-8").decode(rulesets_byte_array);
          const rulesets_json = JSON.parse(rulesets);

          if(rulesets_json.timestamp != rulesets_timestamp){
            reject(update_channel.name + ': Downloaded ruleset had an incorrect timestamp.  This may be an attempted downgrade attack.  Aborting.');
          } else {
            await store.local.set_promise('rulesets: ' + update_channel.name, window.btoa(rulesets_gz));
            resolve(true);
          }
        } else {
          reject(update_channel.name + ': Downloaded ruleset signature is invalid.  Aborting.');
        }
      }).catch(() => {
        reject(update_channel.name + ': Downloaded ruleset signature could not be verified.  Aborting.');
      });
    }).catch(() => {
      reject(update_channel.name + ': Could not import key.  Aborting.');
    });
  });
}

// Unzip and apply the rulesets we have stored.
async function applyStoredRulesets(rulesets_obj){
  let rulesets_promises = [];
  for(let update_channel of update_channels){
    rulesets_promises.push(new Promise(resolve => {
      const key = 'rulesets: ' + update_channel.name
      chrome.storage.local.get(key, root => {
        if(root[key]){
          util.log(util.NOTE, update_channel.name + ': Applying stored rulesets.');

          const rulesets_gz = window.atob(root[key]);
          const rulesets_byte_array = pako.inflate(rulesets_gz);
          const rulesets = new TextDecoder("utf-8").decode(rulesets_byte_array);
          const rulesets_json = JSON.parse(rulesets);
          resolve(rulesets_json);
        } else {
          resolve();
        }
      });
    }));
  }

  await performCheck();
  const rulesets_jsons = await Promise.all(rulesets_promises);
  if(rulesets_jsons.join("").length > 0){
    for(let rulesets_json of rulesets_jsons){
      rulesets_obj.addFromJson(rulesets_json.rulesets);
    }
  } else {
    //rulesets_obj.addFromJson(util.loadExtensionFile('rules/default.rulesets', 'json'));
  }
}

// basic workflow for periodic checks
async function performCheck() {
  util.log(util.NOTE, 'Checking for new rulesets.');

  const current_timestamp = Date.now() / 1000;
  store.local.set_promise('last-checked', current_timestamp);

  let num_updates = 0;
  for(let update_channel of update_channels){
    let new_rulesets_timestamp = await checkForNewRulesets(update_channel);
    if(new_rulesets_timestamp){
      util.log(util.NOTE, update_channel.name + ': A new ruleset bundle has been released.  Downloading now.');
      let new_rulesets = await getNewRulesets(new_rulesets_timestamp, update_channel);
      try{
        await verifyAndStoreNewRulesets(new_rulesets, new_rulesets_timestamp, update_channel);
        store.local.set_promise('rulesets-stored-timestamp: ' + update_channel.name, new_rulesets_timestamp);
        num_updates++;
      } catch(err) {
        util.log(util.WARN, update_channel.name + ': ' + err);
      }
    }
  }
  if(num_updates > 0){
    background_callback();
  }
};

chrome.storage.onChanged.addListener(async function(changes, areaName) {
  if (areaName === 'sync' || areaName === 'local') {
    if ('autoUpdateRulesets' in changes) {
      if (changes.autoUpdateRulesets.newValue) {
        await createTimer();
      } else {
        destroyTimer();
      }
    }
  }
});

let initialCheck,
  subsequentChecks;

async function createTimer(){
  const time_to_next_check = await timeToNextCheck();

  initialCheck = setTimeout(() => {
    performCheck();
    subsequentChecks = setInterval(performCheck, periodicity * 1000);
  }, time_to_next_check * 1000);
}

function destroyTimer(){
  if (initialCheck) {
    clearTimeout(initialCheck);
  }
  if (subsequentChecks) {
    clearInterval(subsequentChecks);
  }
}

async function initialize(store_param, cb){
  store = store_param;
  background_callback = cb;

  await createTimer();
}

function getPeriodicity() {
  return periodicity;
}

Object.assign(exports, {
  applyStoredRulesets,
  initialize,
  getRulesetTimestamps,

  // Needed for testing
  getPeriodicity,
  performCheck
});

})(typeof exports == 'undefined' ? require.scopes.update = {} : exports);
