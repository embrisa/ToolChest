# Safari Compatibility Quick Reference

## 🚀 For New Components (Recommended)

```html
<div class="glass-light">...</div>     <!-- Light glass effect -->
<div class="glass-medium">...</div>    <!-- Medium glass effect -->  
<div class="glass-dark">...</div>      <!-- Dark glass effect -->
```

**✅ Safari fallbacks are automatic - no additional CSS needed!**

## 🔧 For Existing Components (Quick Fix)

Add these CSS variables to get automatic Safari fallbacks:

```css
.my-component {
    --glass-bg: rgba(254, 247, 237, 0.1);      /* Background for Safari */
    --glass-border: rgba(254, 247, 237, 0.15); /* Border for Safari */
}
```

## 🎨 Glass Morphism Levels

| Class | Background | Border | Use Case |
|-------|------------|--------|----------|
| `.glass-light` | `rgba(254, 247, 237, 0.1)` | `rgba(254, 247, 237, 0.15)` | Cards, panels |
| `.glass-medium` | `rgba(254, 247, 237, 0.08)` | `rgba(254, 247, 237, 0.12)` | Main containers |
| `.glass-dark` | `rgba(26, 21, 16, 0.7)` | `rgba(180, 83, 9, 0.25)` | Admin, modals |

## 🐛 Common Issues

### Transparent background in Safari?
```css
.component {
    --glass-bg: rgba(254, 247, 237, 0.1);    /* Add this */
    --glass-border: rgba(254, 247, 237, 0.15); /* And this */
}
```

### Text hard to read?
```css
.component {
    --glass-bg: rgba(254, 247, 237, 0.15);    /* More opaque */
}
```

## ✅ Testing Checklist

- [ ] Chrome/Firefox: Glass morphism works
- [ ] Safari: Solid backgrounds, no artifacts  
- [ ] Text readable in both browsers
- [ ] Interactive states work everywhere

## 🚫 What NOT to Do

```css
/* ❌ Don't do this - no Safari fallbacks */
.bad-component {
    background: rgba(254, 247, 237, 0.1);
    backdrop-filter: blur(16px);
}

/* ✅ Do this instead */
.good-component {
    --glass-bg: rgba(254, 247, 237, 0.1);
    --glass-border: rgba(254, 247, 237, 0.15);
}
```

## 💡 Pro Tips

1. **New components**: Always use `.glass-*` classes
2. **Existing components**: Add `--glass-*` variables  
3. **Test early**: Check Safari during development
4. **Different ≠ Broken**: Components will look different in Safari (that's OK!)

---

**Need help?** See `SAFARI_COMPATIBILITY_GUIDE.md` for complete documentation. 