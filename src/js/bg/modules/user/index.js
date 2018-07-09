/**
* The User module deals with everything that requires some
* form of authentication. It is currently very tighly coupled
* with the VoIPGRID vendor, but in theory should be able to deal
* with other authentication backends.
* @module ModuleUser
*/
const Module = require('../../lib/module')


/**
* Main entrypoint for User.
* @memberof AppBackground.modules
*/
class ModuleUser extends Module {
    /**
    * Setup events that can be called upon from `AppForeground`.
    * The update-token event is called each time when a user
    * opens a vendor platform url through `openPlatformUrl`.
    * @param {AppBackground} app - The background application.
    * @param {UserProvider} UserAdapter - An adapter that handles authentication and authorization.
    */
    constructor(app, UserAdapter) {
        super(app)

        this.adapter = new UserAdapter(app)
        // Other implementation may use other user identifiers than email,
        // that's why the main event uses `username` instead of `email`.
        this.app.on('bg:user:login', this.adapter.login.bind(this))
        this.app.on('bg:user:logout', this.adapter.logout.bind(this))
        this.app.on('bg:user:unlock', this.adapter.unlock.bind(this))

        this.app.on('bg:user:set_session', ({session}) => {
            app.setSession(session)
        })

        this.app.on('bg:user:remove_session', ({session}) => {
            app.removeSession(session)
        })
    }


    /**
    * Initializes the module's store.
    * @returns {Object} The module's store properties.
    */
    _initialState() {
        return Object.assign({
            authenticated: false,
            developer: false,
            settings: {
                voip: true,
            },
            status: null,
            username: null,
        }, this.adapter._initialState())
    }


    /**
    * Call for platform data from the provider.
    */
    async _platformData() {
        if (this.adapter._platformData) this.adapter._platformData()
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[user] `
    }
}

module.exports = ModuleUser