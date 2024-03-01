const GA_PREFIX = 'ls2-GA_';

const set = async (key, value, expiryDate) => {
  const item = {
    value,
    expiry: expiryDate ? expiryDate.getTime() : 0,
  };
  await chrome.storage.local.set({ [key]: item });
};
const get = async (key) => {
  const itemObj = (await chrome.storage.local.get(key))[key];
  if (!itemObj || !itemObj.value) {
    return null;
  }

  const now = new Date();

  if (itemObj.expiry > 0 && now.getTime() > itemObj.expiry) {
    await chrome.storage.local.remove(key);
    return null;
  }
  return itemObj.value;
};

export { GA_PREFIX, get, set };
