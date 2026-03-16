local logger = require("logger")
local millennium = require("millennium")

local function on_load()
    local success, err = pcall(function()
        logger:info("[steam-streak] loading v1.0.0, Millennium " .. millennium.version())
        millennium.ready()
    end)

    if not success then
        logger:error("[steam-streak] on_load failed: " .. tostring(err))
        pcall(function() millennium.ready() end)
    end
end

local function on_frontend_loaded()
end

local function on_unload()
end

local function show_windows_notification(title, message, icon_path)
    local success, err = pcall(function()
        local escaped_title = title:gsub('"', '\\"')
        local escaped_message = message:gsub('"', '\\"')

        local ps_script = string.format([[
Add-Type -AssemblyName System.Windows.Forms
$notification = New-Object System.Windows.Forms.NotifyIcon
$notification.Icon = [System.Drawing.SystemIcons]::Information
$notification.BalloonTipTitle = "%s"
$notification.BalloonTipText = "%s"
$notification.Visible = $true
$notification.ShowBalloonTip(10000)
Start-Sleep -Seconds 10
$notification.Dispose()
]], escaped_title, escaped_message)

        local temp_file = os.getenv("TEMP") .. "\\steam_streak_notify.ps1"
        local f = io.open(temp_file, "w")
        if f then
            f:write(ps_script)
            f:close()

            local command = 'powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "' .. temp_file .. '"'
            os.execute(command)

            logger:info("[steam-streak] Windows notification shown: " .. title)
        else
            logger:error("[steam-streak] Failed to create temp file")
        end

        return true
    end)

    if not success then
        logger:error("[steam-streak] show_windows_notification failed: " .. tostring(err))
        return false
    end

    return true
end

return {
    on_load = on_load,
    on_frontend_loaded = on_frontend_loaded,
    on_unload = on_unload,
    show_windows_notification = show_windows_notification
}
