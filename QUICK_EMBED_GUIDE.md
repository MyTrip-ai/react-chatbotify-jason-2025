# Quick Embed Guide

## 📺 Direct Access vs iframe Embedding

### Direct Access (Full Screen)
When you access the widget directly (e.g., `http://localhost:3002/YOUR_BOT_ID?embedded=true`), it fills the entire browser window automatically.

### iframe Embedding (Recommended for Websites)
When embedding in another website, use an iframe with a parent container to control size.

---

## 🚀 TL;DR - Copy & Paste This

```html
<!-- Paste this anywhere in your website -->
<div style="width: 100%; max-width: 500px; height: 650px; margin: 0 auto;">
  <iframe 
    src="https://YOUR_DOMAIN/YOUR_BOT_ID?embedded=true"
    style="width: 100%; height: 100%; border: none;"
    allow="microphone">
  </iframe>
</div>
```

Replace:
- `YOUR_DOMAIN` with your production domain
- `YOUR_BOT_ID` with your bot configuration ID

---

## 📏 How Sizing Works

### Default Behavior (Recommended)
The widget **automatically fills 100% width and height** of its parent container.

**You control the size by styling the parent div:**

```html
<!-- Small widget -->
<div style="width: 350px; height: 500px;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%;"></iframe>
</div>

<!-- Large widget -->
<div style="width: 600px; height: 800px;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%;"></iframe>
</div>

<!-- Full screen -->
<div style="width: 100vw; height: 100vh;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%;"></iframe>
</div>
```

### Alternative: URL Parameters (Override)
You can also specify size via URL parameters:

```html
<iframe src="https://YOUR_DOMAIN/YOUR_BOT_ID?embedded=true&width=400&height=600"></iframe>
```

**Both approaches coexist:**
- No URL params → Widget fills 100% of parent ✅ (Recommended)
- With URL params → Widget uses specified size (overrides default)

---

## 🎯 Common Use Cases

### Centered on Page
```html
<div style="width: 100%; max-width: 500px; height: 650px; margin: 40px auto;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%; border: none;"></iframe>
</div>
```

### Sidebar (Fixed Right)
```html
<div style="position: fixed; right: 0; top: 0; width: 400px; height: 100vh; z-index: 1000;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%; border: none;"></iframe>
</div>
```

### Full Page
```html
<div style="width: 100%; height: 100vh; margin: 0; padding: 0;">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%; border: none;"></iframe>
</div>
```

### Responsive (Mobile-Friendly)
```html
<style>
  .chatbot {
    width: 100%;
    max-width: 500px;
    height: 650px;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    .chatbot { height: 500px; }
  }
</style>

<div class="chatbot">
  <iframe src="...?embedded=true" style="width: 100%; height: 100%; border: none;"></iframe>
</div>
```

---

## 🎨 Customization

### Custom Colors & Branding
```html
<iframe src="https://YOUR_DOMAIN/YOUR_BOT_ID?embedded=true&primaryColor=FF5733&title=Support%20Chat"></iframe>
```

Available parameters:
- `primaryColor` - Primary color (hex without #)
- `secondaryColor` - Secondary color (hex without #)
- `title` - Header title
- `logoUrl` - Logo URL (URL-encoded)

---

## ✅ Production Checklist

- [ ] Replace `localhost` with production domain
- [ ] Use HTTPS
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Verify microphone permissions work (if using voice)

---

## 📚 More Resources

- **Full Documentation:** `EMBEDDED_MODE.md`
- **Complete Examples:** `EMBED_SNIPPET.html`
- **Demo:** `embed-demo.html`

---

## 💡 Why This Approach?

**Container-based sizing (recommended):**
- ✅ More flexible and maintainable
- ✅ Works with responsive design
- ✅ Easier to adjust without changing URLs
- ✅ Standard web development practice

**URL parameters (alternative):**
- ✅ Quick testing and prototyping
- ✅ Override default behavior when needed
- ✅ Useful for dynamic sizing

Both work great - choose what fits your needs!
