import {
  type H3Event,
  send,
  sendRedirect,
  getHeader,
} from 'h3'
import { escape } from 'html-escaper'

import type { CookieSerializeOptions } from 'cookie-es'

/**
 * Redirect to target url with cookie samesite strict protection
 * @param event H3Event
 * @param url redirect url
 * @param cookieConfig cookie config
 */
export default async function sendRedirectPage (event: H3Event, url: string, cookieConfig: CookieSerializeOptions) {
  const isCookieStrict = cookieConfig.sameSite === 'strict' || cookieConfig.sameSite === true
  const isIframe       = getHeader(event, 'sec-fetch-dest') === 'iframe'

  if (isCookieStrict || isIframe) {
    // Use meta refresh as redirection to fix issue with cookies samesite=strict
    // See: https://stackoverflow.com/questions/42216700/how-can-i-redirect-after-oauth2-with-samesite-strict-and-still-get-my-cookies
    await send(event, `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="0;URL='${escape(url)}'" />

        <title>Processing...</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link rel="preconnect" href="https://cdn.jsdelivr.net">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.min.css">

        <style>
          :root {
            font-family: "DM Sans", sans-serif;
            color: #6E7074;
          }

          body {
            background-color: #FDFDFD;
          }

          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }

          .logo {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .spinner {
            color: #C2C3C5;
            font-size: 1.5rem;
            margin-top: 1.5rem;
          }

          a {
            color: #0057B4;
          }

          footer {
            flex-shrink: 0;
            font-size: .75rem;
            line-height: 1rem;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="logo">
            <svg width="136" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 136 36">
              <g clip-path="url(#a)">
                <ellipse cx="18.003" cy="17.983" fill="#E42E2C" rx="18.003" ry="17.983"/>
                <ellipse cx="18.003" cy="17.983" fill="url(#b)" fill-opacity=".2" rx="18.003" ry="17.983" style="mix-blend-mode:multiply"/>
                <path fill="#E42E2C" d="M26.654 33.73a18.351 18.351 0 0 0 5.583-4.717L51.714 4.377A20.409 20.409 0 0 0 44.782.805 20.064 20.064 0 0 0 37.06.11c-2.584.274-5.129.93-7.338 2.29-.978.603-1.392 1.134-2.09 2.028l-.042.054-21.402 27.07a17.747 17.747 0 0 0 6.29 3.56 17.925 17.925 0 0 0 7.213.768 18.18 18.18 0 0 0 6.963-2.15Z"/>
                <path fill="#E42E2C" fill-rule="evenodd" d="m60.976 10.725-.018.018-.012.024c-1.03 1.715-1.65 3.405-1.863 5.084v17.827h2.958v-9.795c.889.955 1.857 1.69 2.922 2.213 1.278.614 2.678.925 4.194.925 2.69 0 4.998-.986 6.903-2.937 1.912-1.952 2.867-4.33 2.867-7.115 0-2.736-.961-5.089-2.885-7.029-1.924-1.94-4.243-2.918-6.958-2.918-1.546 0-3 .298-4.364.9-1.358.595-2.606 1.532-3.744 2.803Zm11.432.121a6.919 6.919 0 0 1 2.575 2.621 7.135 7.135 0 0 1 .956 3.588c0 1.246-.323 2.45-.974 3.605-.64 1.143-1.498 2.031-2.588 2.664a6.76 6.76 0 0 1-3.457.936 7.217 7.217 0 0 1-3.561-.936c-1.12-.639-1.979-1.49-2.581-2.56-.603-1.089-.907-2.299-.907-3.643 0-2.073.681-3.782 2.039-5.162s3.013-2.067 4.98-2.067a6.76 6.76 0 0 1 3.518.954Z" clip-rule="evenodd"/>
                <path fill="#E42E2C" d="m82.209 15.911-.007.025v10.963h3.026v-6.543c0-2.87.146-4.785.426-5.788.377-1.125 1.053-2.171 2.045-3.138.98-.948 1.906-1.192 2.806-.857l.232.085L92.259 8.2l-.268-.152c-.773-.444-1.522-.68-2.24-.68-.968 0-2.13.492-3.47 1.398-1.388.936-2.472 2.402-3.275 4.366-.353.723-.615 1.654-.797 2.778ZM93.093 4.127c.438.438.98.663 1.594.663.621 0 1.157-.225 1.595-.663.45-.45.676-.99.676-1.611a2.15 2.15 0 0 0-.682-1.593 2.18 2.18 0 0 0-1.595-.657c-.62 0-1.156.225-1.594.663a2.18 2.18 0 0 0-.664 1.593 2.3 2.3 0 0 0 .67 1.605ZM96.185 7.867h-2.977v19.069h2.977V7.866ZM101.779 7.897h-3.19l8.791 19.069h.803l8.735-19.069h-3.201l-5.942 13.019-5.996-13.019ZM132.733 7.897l-5.77 13.31-5.942-13.31h-3.171l7.512 16.904-3.689 8.428h3.165l11.097-25.332h-3.202Z"/>
              </g>
              <defs>
                <linearGradient id="b" x1="18.003" x2="10.688" y1="17.983" y2="11.861" gradientUnits="userSpaceOnUse">
                  <stop offset=".158"/>
                  <stop offset=".366" stop-opacity=".75"/>
                  <stop offset=".573" stop-opacity=".5"/>
                  <stop offset=".802" stop-opacity=".25"/>
                  <stop offset="1" stop-opacity="0"/>
                </linearGradient>
                <clipPath id="a">
                  <path fill="#fff" d="M0 0h136v36H0z"/>
                </clipPath>
              </defs>
            </svg>
            <svg data-testid="spinner" class="spinner spinner-ringgo" width="1em" height="1em" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <circle class="spinner-ringgo__track" cx="9" cy="9" r="8" fill="transparent" stroke-width="2px" stroke-opacity="10%" stroke="currentColor"></circle>
              <g>
                <circle class="spinner-ringgo__ring" cx="9" cy="9" r="8" stroke-dasharray="50.2654825" stroke-linecap="round" stroke-width="2px" fill="transparent" stroke="currentColor">
                  <animate attributeName="stroke-dashoffset" values="45.2389342;5.02654825;45.2389342" keyTimes="0;.5;1" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"></animate>
                  <animateTransform attributeType="xml" attributeName="transform" type="rotate" values="0 9 9;45 9 9;360 9 9" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"></animateTransform>
                </circle>
                <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="2s" repeatCount="indefinite"></animateTransform>
              </g>
            </svg>
          </div>

          <footer>
            <p>
              If you are not redirect automatically, <a href="${escape(url)}">click here</a>.
            </p>
          </footer>
        </div>
      </body>
      </html>
    `, 'text/html')

    return
  }

  await sendRedirect(event, url)
}
