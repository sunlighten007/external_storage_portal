import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function getSecretValue(secretName) {
  const client = new SecretsManagerClient({ region: "us-east-2" });
  const command = new GetSecretValueCommand({ SecretId: "XYZ" });

    const response = await client.send(command);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!response1", response)
  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  } else {
    const buff = Buffer.from(response.SecretBinary, 'base64');
    return JSON.parse(buff.toString('ascii'));
  }
}
