import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'dev-noj1ayvz.auth0.com'
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJD0geq+ButnsEMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1ub2oxYXl2ei5hdXRoMC5jb20wHhcNMTkxMTIwMTk0OTE1WhcNMzMw
NzI5MTk0OTE1WjAhMR8wHQYDVQQDExZkZXYtbm9qMWF5dnouYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzws5lVRZKewwWj3GfVSb59kf
QuN2leLXEIlIai1cCyqJl8exLZOOmB+tD8ve2P2mKkyKbHxLfJc0YGchhAiA5S9g
WS5lk0y9nXRyVZ+hTexzOYlSaaSyBVHL6D8DtqAL0G+OlZ2pTOInjkXXWfHCp4SJ
5RMzBaqDOZBzQTVRfHO9zba9p+/0M9WcQweXNz1S+oPqC7Jb2KvcgEVtUujbjaxK
kf3Qe0+a+vYStfWk9CCmmyft5BmGEP3DLeNTB7d+wMoq9LH9sC62AL0MgNJNTExx
4LybFzoTlz+tmzlKLLuDSEr9Zd2tNXdupi3zhMZvSVN0hfSYDTB2EcOSOuBOcQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSNGrjR986QBQpHYpcL
8l/lN0o96zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAFASPzE4
h6pdMOafJa31MCtapijYQ09jNS98S9parzrOJzKzQmn02iX4bMwxuxcuCqUMMUxO
y9vYJ1r9YUQse1CoDmQ2qRiswTRgqS8FqVuJSEhmphwkQ0Z6d/JOcLDBWH5H7kGI
JnLOuhGe16XAaQZoYr8MnyK1WHfVLoqT8xSsLOViP9ThlccepBIDbBCQJyrGZoPU
5g2661icoaT+bu4UoW274yHCpzGgGemOcVIQOKuc3B+/TtkgvS2hEaOZlHn3JR69
PZMxKoWCPA3GfpXyuhyNsxPE8LpRfayGIJN/VE9niSgmPQs6Qeg8GXMhoLq4ZL1c
7+KgqMDqHYM1eB8=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}