import crypto from 'crypto';
import axios from 'axios';

/**
 * Represents an HMAC signature and its timestamp.
 */
type HMACSignature = {
  signature: string;
  timestamp: string;
};

/**
 * Adds a timestamped HMAC signature to the given request's headers.
 */
export function addHMACSignature(
  config: { headers?: Record<string, string> },
  jsonBody: string,
  secret: string
) {
  const signatureData = newHMACSignature(jsonBody, Date.now(), secret);

  config.headers = {
    ...config.headers,
    'X-MultiBaas-Signature': signatureData.signature,
    'X-MultiBaas-Timestamp': signatureData.timestamp,
  };
}

/**
 * Creates an HMAC signature from the given data, timestamp, and secret.
 */
export function newHMACSignature(
  data: string,
  timestamp: number,
  secret: string
): HMACSignature {
  const timestampStr = timestamp.toString();

  // The message is the data + timestamp
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  hmac.update(timestampStr);
  const signature = hmac.digest('hex');

  return { signature, timestamp: timestampStr };
}

// Example Usage
// async function sendRequest() {
//   const secret = 'your_secret_key';
//   const jsonBody = JSON.stringify({ message: 'Hello, MultiBaas!' });

//   const config: { headers?: Record<string, string> } = {};
//   addHMACSignature(config, jsonBody, secret);

//   try {
//     const response = await axios.post(
//       'https://your-multibaas-endpoint.com/webhook',
//       jsonBody,
//       config
//     );
//     console.log(response.data);
//   } catch (error) {
//     console.error('Request failed:', error);
//   }
// }
