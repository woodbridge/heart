/*

  goals:

  1. Save a hash to a table in postgres.
  2. Only save entries in the hash that need to be saved.
  3. be as simple as possible
  4. don't require shitty configuration like: 'foo': { type: 'varchar(255)', constraints: {'not null'}}

  Idol: Carbon paper.  Just write and it will take care of the rest.  Thats what
        I want for my database.

  newUser = Jar('users')
  newUser.set('email', 'test@test.com')
  newUser.save()

  var User = Jar.bar('users')

  users = db.query('select * from users', function(rows) {
    rows.map(function(row) {
      return User(row)
    })
  })
*/

var sqlite = require('sqlite3')
var db = new sqlite.Database(':memory:')

db.serialize(function() {
  db.run('create table bugs (id integer, name text)')
})

var sql = function(hash) {
  var columns = Object.keys(hash)
  var values = columns.map(function(col) {
    return hash[col];
  })
  return {
    columns: columns,
    values: values,
    create: function(table) {
      return "insert into " + table + ' (' + this.columns + ') values (' + this.values + ')'
    },
    update: function(table) {
      var updateStatements = [];
      for(i = 0; i < columns.length; i++) {
        var col = this.columns[i]
        var val = this.values[i]
        updateStatements.push(col + ' = ' + val)
      }
      return "update " + table + ' set ' + updateStatements.join(',')
    }
  }
}

var Jar = function(table, attrs) {
  if (attrs === null || typeof attrs === 'undefined') {
    attrs = {}
  };
  return {
    table: table,
    dirty: false,
    changedAttrs: {},
    attrs: attrs,
    get: function(attr) {
      return this.attrs[attr]
    },
    set: function(attr, val) {
      this.changedAttrs[attr] = val
      this.attrs[attr] = val
      dirty = true
      return true
    },
    save: function() {
      var lazyStatement = sql(this.changedAttrs)
      if (this.attrs.id) {
        console.log(lazyStatement.update(this.table))
      }
      else {
        console.log(lazyStatement.create(this.table))
      }
    }
  }
}


Jar.brand = function(table) {
  return function(attrs) {
    return Jar(table, attrs)
  }
}


var User = Jar.brand('user')
console.log(User())
