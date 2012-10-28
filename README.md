# Heart

A little base model for working with postgres and node.  Quick prototypes and easy to expand.

    npm install heart


## Features

* Keeps tracked of changed attributes.
* Built in Database client with nice api.
* SQL generation.

## Examples

### Simple use of base model.

    user = Heart('users')
    user.set({
      'email': 'jrwoodbridge1@gmail.com',
      'name': 'Justin Woodbridge'
    })

    user.save() # => Boom.

    user.get('id') # => 1
    user.get('name') # => 'Justin Woodbridge'

    user.dirty # => false
    user.set('age', 10)
    user.dirty # => true
    user.save()
    user.dirty # => false

### Fancy Extending

    User = Heart.brand('user')
    User.processor function(blob) {
      blob.age = parseInt(age)
      return blob
    }

    user = User({'name': 'jwoodbridge@me.com', 'age': '16'})
    user.save()

## Fleshed Out Model

    User = Heart.brand('user')
    User.processor function(blob) {
      blob.age = parseInt(age)
      return blob
    }

    User.get = function(id, cb) {
      Heart.Database.query(id, function(err, res) {
        if(err) throw err;
        var user = User(res.rows[0])
        cb(user)
      })
    }

    User.get(1, function(user) {

    })



## Modules
* `Heart` - **Base Model**
* `Heart.Database` - **Database Client**
* `Heart.sql` - **SQL Generation**

## Soon

* Build in some basic finders. eg: `Heart.find`, `Heart.where`
* Heart.destroy()