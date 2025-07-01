module.exports = {
  appns: [
    {
      name: "AniTrack+",
      script: "bin/www",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        JWT_SECRET: "topSecret",
        PORT: 3000,
        GOOGLE_API_KEY: "AIzaSyDiv5d_9a0rIl95TtpSM1Dy59l0SQaEJ3M",
        GOOGLE_CLIENT_ID:
          "184918301811-h4hhhsf8q98k4qg9lh31mn2mcam4vl3i.apps.googleusercontent.com",
        DATABASE_URL:
          "postgresql://postgres.hxjqvmdzguannvcydctl:0VoX5UOf4A9I6H1b@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
      },
    },
  ],
};
