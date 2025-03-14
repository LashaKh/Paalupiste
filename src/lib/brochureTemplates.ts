export interface BrochureTemplate {
  id: string;
  name: string;
  preview: string;
  template: string;
}

export const brochureTemplates: BrochureTemplate[] = [
  {
    id: 'template-1',
    name: 'Template 1',
    preview: 'https://i.imgur.com/9nxPIZv.png',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern Brochure Template</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
    rel="stylesheet"
  />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .brochure-container {
      width: 750px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      text-align: center;
    }

    .header {
      background: linear-gradient(135deg, #2b5876 0%, #4e4376 100%);
      padding: 40px;
      text-align: center;
    }

    .logo {
      max-width: 250px;
      transition: transform 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .content {
      padding: 50px;
      position: relative;
      text-align: left;
    }

    .brochure-title {
      font-size: 2.8em;
      color: #2b5876;
      margin-bottom: 30px;
      text-align: center;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .decorative-line {
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, #2b5876 0%, #4e4376 100%);
      margin: 30px auto;
      border-radius: 2px;
    }

    .placeholder-image {
      display: block;
      width: 100%;
      max-width: 700px;
      margin: 20px auto;
      border: 2px dashed #ccc;
      border-radius: 10px;
    }

    .text-content {
      font-size: 1.1em;
      line-height: 1.8;
      color: #4a4a4a;
      max-width: 700px;
      margin: 0 auto 40px;
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease;
    }

    .text-content:hover {
      transform: translateY(-5px);
    }

    .section {
      margin-bottom: 40px;
    }

    .section h2 {
      font-size: 2em;
      color: #2b5876;
      margin-bottom: 10px;
    }

    .section p {
      margin-bottom: 10px;
    }

    @media (max-width: 768px) {
      .brochure-container {
        width: 100%;
        border-radius: 0;
        box-shadow: none;
      }
      .content {
        padding: 30px;
      }
      .brochure-title {
        font-size: 2em;
      }
      .text-content {
        padding: 15px;
        font-size: 1em;
      }
    }

    @page {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="brochure-container">
    <header class="header">
      <img src="{{logo}}" alt="Company Logo" class="logo" />
    </header>

    <main class="content">
      <h1 class="brochure-title">{{title}}</h1>
      <div class="decorative-line"></div>

      <div class="text-content section">
        <h2>Introduction</h2>
        <p>{{introduction}}</p>
        <img src="{{image1}}" alt="Image 1" class="placeholder-image" />
      </div>

      <div class="text-content section">
        <h2>Our Services</h2>
        <p>{{services}}</p>
        <img src="{{image2}}" alt="Image 2" class="placeholder-image" />
      </div>

      <div class="text-content section">
        <h2>About Us</h2>
        <p>{{about}}</p>
        <img src="{{image3}}" alt="Image 3" class="placeholder-image" />
      </div>

      <div class="text-content section">
        <h2>Contact Information</h2>
        <p>{{contact}}</p>
      </div>
    </main>
  </div>
</body>
</html>`
  },
  {
    id: 'template-2',
    name: 'Template 2',
    preview: 'https://i.imgur.com/xA2GrAn.png',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background-color: #fff;
            color: #000;
            line-height: 1.6;
        }
        .header {
            position: relative;
            margin-bottom: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .logo {
            position: absolute;
            top: 20px;
            right: 20px;
            height: 40px;
        }
        .doc-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }
        h1, h2 {
            color: #000;
        }
        p, ul {
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://paalupiste.com/wp-content/themes/paal/img/logo.png" alt="Paalupiste" class="logo">
        <div class="doc-info">
            <p>Document ID: SPEC-{{timestamp}}</p>
            <p>Generated: {{date}}</p>
        </div>
        <h1>{{title}}</h1>
    </div>
    {{content}}
    <div class="footer">
        <p>www.paalupiste.com | info@paalupiste.com</p>
        <p>Technical Documentation | Rev. 1.0</p>
    </div>
</body>
</html>`
  },
  {
    id: 'template-3',
    name: 'Template 3',
    preview: 'https://i.imgur.com/mXuM5uy.png',
    template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background-color: #fff;
            color: #000;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: right;
            margin-bottom: 40px;
        }
        .logo {
            height: 40px;
        }
        h1 {
            text-align: left;
            border-bottom: 1px solid #FF3A2D;
            padding-bottom: 10px;
        }
        h1, h2 {
            color: #000;
        }
        p, ul {
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://paalupiste.com/wp-content/themes/paal/img/logo.png" alt="Paalupiste" class="logo">
    </div>
    <h1>{{title}}</h1>
    {{content}}
    <div class="footer">
        <p>www.paalupiste.com | info@paalupiste.com</p>
    </div>
</body>
</html>`
  }
];