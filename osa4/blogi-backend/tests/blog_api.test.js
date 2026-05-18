const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
let token

const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = await new User({
    username: 'root',
    name: 'Superuser',
    passwordHash
  }).save()
  
  token = jwt.sign(
    { username: user.username, id: user._id.toString() },
    process.env.SECRET
  )

  const blogsWithUser = helper.initialBlogs.map(blog => ({
    ...blog,
    user: user._id
  }))

  await Blog.insertMany(blogsWithUser)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')

    const blog = response.body[0]
    assert(blog.id)
    assert.strictEqual(blog._id, undefined)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Test blog',
      author: 'Oskar',
      url: 'https://example.com',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('Test blog'))
  })

  test('fails with status code 401 if token is not provided', async () => {
    const newBlog = {
      title: 'No token',
      author: 'Oskar',
      url: 'https://example.com',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map(b => b.id)
    assert(!ids.includes(blogToDelete.id))
  })

  test('fails with status code 403 if user is not the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const passwordHash = await bcrypt.hash('sekret', 10)
    const otherUser = await new User({
      username: 'other',
      name: 'Other user',
      passwordHash
    }).save()

    const otherToken = jwt.sign(
      { username: otherUser.username, id: otherUser._id.toString() },
      process.env.SECRET
    )

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
    test('succeeds in updating likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
  
      const updatedData = {
        likes: blogToUpdate.likes + 1
      }
  
      const result = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      assert.strictEqual(result.body.likes, blogToUpdate.likes + 1)
  
      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)
  
      assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
    })
})


  test('if likes is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'No likes given',
      author: 'Oskar',
      url: 'https://example.com'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })


  test('fails with status code 400 if title is missing', async () => {
    const newBlog = {
      author: 'Oskar',
      url: 'https://example.com',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status code 400 if url is missing', async () => {
    const newBlog = {
      title: 'No url',
      author: 'Oskar',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })


after(async () => {
  await mongoose.connection.close()
})