require 'sinatra'
require 'sinatra-websocket'
require 'thin'
require 'json'
require 'set'
require 'digest/md5'
require 'socket'

logger = Logger.new(STDERR)
logger.level = Logger::WARN
logger.level = Logger::DEBUG

set server: 'thin', bind: '0.0.0.0', port: 8888
set namespaces: {}
set server_channel:         'server',
    default_channel:        'message',
    connect_channel:        'connect',
    disconnect_channel:     'disconnect',
    private_channel_prefix: 'private'

def local_address
  [Socket.ip_address_list.detect(&:ipv4_private?).ip_address, settings.port].join(':')
end

def deliver(namespace, channel, from, data)
  logger.debug("DELIVER(#{namespace}, #{channel}, #{from}, #{data})")
  return unless settings.namespaces[namespace][:channels][channel]
  settings.namespaces[namespace][:channels][channel].subtract([from]).each do |id|
    next unless settings.namespaces[namespace][:clients][id]
    # allow subscription to private-channel without having to know your id
    chan = channel.start_with?(settings.private_channel_prefix) ? settings.private_channel_prefix : channel
    settings.namespaces[namespace][:clients][id].send({ channel: chan, from: from, data: data, uid: id }.to_json)
    logger.debug("Sending #{data} to #{id} on channel #{chan} from #{from}")
  end
end

get '/:namespace/?' do
  if request.websocket?
    request.websocket do |socket|
      client_id = Digest::MD5.hexdigest(socket.hash.to_s)
      namespace = "#{params[:namespace]}#{params[:room]}"

      socket.onopen do
        logger.info("CONNECTED #{namespace}/#{client_id}")
        begin
          settings.namespaces[namespace] ||= { clients: {}, channels: {} }
          settings.namespaces[namespace][:clients][client_id] = socket
          deliver(namespace, settings.connect_channel, client_id, {})
        rescue
          logger.error("#{$!} - #{$@.join("\n")}")
        end
      end

      socket.onmessage do |m|
        logger.info("MESSAGE\t#{namespace}/#{client_id} : #{m}")
        EM.next_tick do
          begin
            msgs = (JSON.parse(m, symbolize_names: true) rescue {})
            msgs = [msgs] unless msgs.is_a?(Array)
            msgs.each do |msg|
              next unless msg.is_a?(Hash)
              data = msg[:data] || {}
              channel = msg[:channel] || settings.default_channel
              # handle special server channel
              if channel == settings.server_channel
                if data[:subscribe]
                  Array(data[:subscribe]).each do |c|
                    # start_with because otherwise there may be spies
                    c = "#{c}#{client_id}" if c.start_with?(settings.private_channel_prefix)
                    settings.namespaces[namespace][:channels][c] ||= Set.new
                    settings.namespaces[namespace][:channels][c].add(client_id)
                    logger.debug("SUBSCRIBED\t#{namespace}/#{client_id} to #{c}")
                  end
                end
                if data[:unsubscribe]
                  Array(data[:unsubscribe]).each do |c|
                    c = "#{c}#{client_id}" if c == settings.private_channel_prefix
                    if settings.namespaces[namespace][:channels][c]
                      settings.namespaces[namespace][:channels][c].delete(client_id)
                      settings.namespaces[namespace][:channels].delete(c) if settings.namespaces[namespace][:channels][c].empty?
                      logger.debug("UNSUBSCRIBED\t#{namespace}/#{client_id} from #{c}")
                    end
                  end
                end
              else # handle normal channels
                puts "\n#{[namespace, channel, client_id, data].inspect}\n"
                deliver(namespace, channel, client_id, data)
              end
            end
          rescue
            logger.error("#{$!} - #{$@.join("\n")}")
          end
        end
      end

      socket.onclose do
        logger.info("DISCONNECTED\t#{namespace}/#{client_id}")
        begin
          settings.namespaces[namespace][:clients].delete(client_id)
          settings.namespaces[namespace][:channels].each { |c| c.delete(client_id) }
          deliver(namespace, settings.disconnect_channel, client_id, {})
          settings.namespaces.delete(namespace) if settings.namespaces[namespace][:clients].empty?
        rescue
          logger.error("#{$!} - #{$@.join("\n")}")
        end
      end

      logger.debug(Hash[settings.namespaces.map{|k,v| [k, {channels: v[:channels], clients: v[:clients].keys}]}].inspect)
    end
  else
    redirect "#{params[:namespace]}/index.html"
  end
end

# TODO: nicer app index
get '/?' do
  '<html><head><title>gameb0x</title><style>'<<
  'body{ text-align: center; font-size: 2em; background: #111; color: #eee; }'<<
  'a { margin: 2em; text-decoration: none; color: #3e3; }' <<
  'a:hover, a:active { color: #5f5; }' <<
  '</style></head><body><h1>gameb0x</h1>' <<
  "<h3>Address: #{local_address}</h3>" <<
  Dir[File.join(settings.public_folder, '*')].select{|e|
    e[0] != '_' &&
    File.directory?(e) &&
    #File.exist?(File.join(e, 'index.html')) &&
    File.exist?(File.join(e, 'app.html')) &&
    File.exist?(File.join(e, 'controller.html'))
  }.map{|e|
    "<a href='#{File.basename(e)}'>#{File.basename(e)}</a>"
  }.join("<br><br>\n") <<
  '</body></html>'
end

not_found do
  request.path_info.match(/\/(.*?)\/?index\.html?/)
  app = "#{$1}".match(/\w+/)[0]
  path = File.join(settings.public_folder, app)
  if File.exist?(path)
    "<!DOCTYPE html>
    <html><head>
    <meta charset='utf-8' />
    <title>#{app}</title>
    <style>
      body{ text-align: center; margin-top: 25vh; font-weight: bold; font-family: arial; }
      h1{ margin: 2em; }
      a{ margin: 2em; padding: 2em; display: inline-block; width: 25vw; background: #4E9CAF; border-radius: .5em; color: white; text-decoration: none; }
      a:hover, a:active{ background: #2E7C8F; }
    </style>
    </head>
    <body>
      <h1>#{app}</h1>
      <a href='app.html'>Game Screen</a>
      <a href='controller.html'>Controller</a><br>
      <a href='..'>Back</a>
    </body></html>"
  else
    status 404
    'not found'
  end
end
