<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS</title>
        <style>
          :root { color-scheme: dark; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Helvetica, Arial, sans-serif;
            background: #051a2c;
            color: #e8f4f8;
            margin: 0;
            padding: 2.5rem 1rem;
            line-height: 1.5;
          }
          .container { max-width: 760px; margin: 0 auto; }
          h1 { font-size: 1.85rem; margin: 0 0 .5rem; }
          .lead { color: #b9d6e3; max-width: 60ch; }
          .badge {
            display: inline-block;
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.12);
            color: #b9d6e3;
            padding: .15rem .55rem;
            border-radius: 999px;
            font-size: .75rem;
            text-transform: uppercase;
            letter-spacing: .08em;
            margin-bottom: 1rem;
          }
          ol { padding: 0; margin-top: 2.5rem; list-style: none; }
          li {
            border-top: 1px solid rgba(255,255,255,.1);
            padding: 1.25rem 0;
          }
          li a { color: #79c8e8; text-decoration: none; font-weight: 600; font-size: 1.1rem; }
          li a:hover { text-decoration: underline; }
          time { color: #80a0b3; font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; }
          p.summary { color: #cfdfe7; margin: .35rem 0 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">RSS feed</span>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="lead"><xsl:value-of select="/rss/channel/description"/></p>
          <p>
            <a href="{/rss/channel/link}" style="color:#79c8e8">← Back to the website</a>
          </p>
          <ol>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <time><xsl:value-of select="pubDate"/></time>
                <br/>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <p class="summary"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ol>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
