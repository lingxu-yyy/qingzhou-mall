// 商品图片解析：数据库 image 字段存的是相对 src/images 的路径（如 'products/ROG枪神9.png'、'葡萄.png'），
// 通过 Vite 的 import.meta.glob 在构建时收集全部图片资源，运行时按路径后缀匹配出可访问的 URL。
const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,gif}', {
  eager: true,
  query: '?url',
  import: 'default'
})

// 兜底图片
const fallbackImage = imageModules['../images/loading.gif'] || ''

export function resolveProductImage(imagePath) {
  if (!imagePath) return fallbackImage

  const normalized = String(imagePath).replace(/^\/?src\/images\//, '').replace(/^images\//, '')
  const hitKey = Object.keys(imageModules).find((key) => {
    const cleanKey = key.replace(/^\.\.\//, '')
    return cleanKey === `images/${normalized}` || cleanKey.endsWith(`/images/${normalized}`)
  })

  return hitKey ? imageModules[hitKey] : fallbackImage
}

export default resolveProductImage
