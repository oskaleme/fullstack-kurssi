const dummy = (blogs) => {
    return 1
  }
  
  const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }
  
  const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    return blogs.reduce((fav, blog) => {
      return blog.likes > fav.likes ? blog : fav
    })
  }

  const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    const counts = {}
  
    blogs.forEach(blog => {
      counts[blog.author] = (counts[blog.author] || 0) + 1
    })
  
    let topAuthor = null
    let topBlogs = 0
  
    Object.keys(counts).forEach(author => {
      if (counts[author] > topBlogs) {
        topAuthor = author
        topBlogs = counts[author]
      }
    })
  
    return {
      author: topAuthor,
      blogs: topBlogs
    }
  }
  
  const mostLikes = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    const likes = {}
  
    blogs.forEach(blog => {
      likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    })
  
    let topAuthor = null
    let topLikes = 0
  
    Object.keys(likes).forEach(author => {
      if (likes[author] > topLikes) {
        topAuthor = author
        topLikes = likes[author]
      }
    })
  
    return {
      author: topAuthor,
      likes: topLikes
    }
  }

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }
