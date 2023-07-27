/**
 * Live demo: https://codepen.io/adenvt/pen/gOQjgyM
 * @param url redirect url
 */
export default function getRedirectPage (url: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="0;URL='${url}'" />

      <title>Processing...</title>

      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com">x
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.min.css">

      <style>
        @keyframes progressbar {
          0% {
            transform: translateX(-75%);
          }

          100% {
            transform: translateX(225%);
          }
        }

        :root {
          font-family: 'DM Sans', sans-serif;
          color: #0D1117;
        }

        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .loading {
          width: 100%;
          border-radius: 9999px;
          height: 4px;
          background: #F3F3F3;
          overflow: hidden;
          isolation: isolate;
        }

        .loading__bar {
          border-radius: 9999px;
          height: 100%;
          width: 40%;
          background: #0065D1;
          animation: progressbar 1s alternate ease-in-out infinite;
        }

        h1 {
          font-size: 2rem;
          line-height: 1.67;
          margin-top: 0;
          margin-bottom: .5rem;
        }

        a {
          color: #0057B4;
        }

        body {
          background-color: #FDFDFD;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div>
          <h1>
            Processing...
          </h1>
          <div class="loading">
            <div class="loading__bar"></div>
          </div>
          <p>Please wait a while. If you are not redirect automatically, <a href="${url}">click here</a>.</p>
        </div>
      </div>
    </body>
  </html>
`
}
