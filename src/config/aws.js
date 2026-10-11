// AWS CONFIG (not used by any route yet)
// Settings you'd pass to the AWS SDK when you add services like S3 or DynamoDB.
// Keys come only from .env (or the SDK's default credential chain). Never
// hardcode them, and never commit real ones. See docs/configuration.md.
module.exports = {
    region: process.env.AWS_REGION || 'us-east-1', // || gives a safe default
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
