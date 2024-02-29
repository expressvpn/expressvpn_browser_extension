// @ts-ignore
import * as chromeStorage from '@/scripts/modules/chromeStorage';
import { v4 as uuidv4 } from 'uuid';
import { Analytics } from '@rudderstack/analytics-js-service-worker';
import { getExtensionVersion } from './utils';

class Telemetry {
  bk = {};
  rudderstackClient = undefined;

  constructor(bk) {
    this.bk = bk;
    this.rudderstackClient = new Analytics(__RS_WRITE_KEY__, `${__RS_DATAPLANE_URL__}/v1/batch`);
  }

  async send(category, action, attachAppInfo = false) {
    let uuid = await chromeStorage.get('uuid');
    if (!uuid) {
      uuid = uuidv4();
      await chromeStorage.set('uuid', uuid);
    }
    if (!this.bk.prefs.helpImprove) {
      return;
    }

    const fetchOptions = {
      method: 'POST',
      // @ts-ignore
      body: new URLSearchParams({
        v: 1,
        tid: __IS_BETA__ || __IS_ALPHA__ || process.env.NODE_ENV === 'development' ? 'UA-29468734-12' : 'UA-29468734-11',
        cid: uuid,
        aip: 1,
        t: 'event',
        ec: category,
      }),
    };
    if (action) {
      fetchOptions.body.append('ea', action);
    }
    if (attachAppInfo) {
      const dimensions = [
        {
          name: 'desktop_app_version',
          index: 1,
          value: this.bk.currentInfo.app.version,
        },
        {
          name: 'extension_version',
          index: 2,
          value: chrome.runtime.getManifest().version,
        },
        {
          name: 'connection_state',
          index: 3,
          value: this.bk.currentInfo.state === 'connected' ? 'use_vpn' : 'not_connected',
        },
      ];
      dimensions.forEach((el) => fetchOptions.body.append(`cd${el.index}`, el.value));
    }

    const jsonBody = {};
    fetchOptions.body.forEach((value, key) => {
      jsonBody[key] = value;
    });

    try {
      const EVENT_PLACEHOLDER='XV'
      this.rudderstackClient.track({
        userId: uuid,
        event: category || EVENT_PLACEHOLDER, // ensure event is not empty, otherwise Rudderstack would throw an error
        properties: jsonBody,
        context: {
          // anonymize user's IP address
          // https://www.rudderstack.com/docs/event-spec/standard-events/common-fields/#how-rudderstack-collects-ip-address
          ip: '0.0.0.0',
          app:{
            version:getExtensionVersion(true)
          }
        }
      });
    } catch (e) {
      console.error('Failed to send event to Rudderstack: ' + e);
    }

    try {
      await fetch('https://www.google-analytics.com/collect', fetchOptions);
    } catch (e) {
      console.error('Failed to send event to GA: ' + e);
    }
  }
}

export default Telemetry;
