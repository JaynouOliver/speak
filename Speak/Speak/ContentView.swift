//
//  ContentView.swift
//  Speak
//
//  Created by Subhro on 4/23/25.
//

import SwiftUI
import AppKit

// Add color extension for system colors
extension Color {
    static let background = Color(NSColor.windowBackgroundColor)
    static let secondaryBackground = Color(NSColor.underPageBackgroundColor)
    static let tertiaryBackground = Color(NSColor.controlBackgroundColor)
}

struct SidebarItem: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
}

struct StatCard: View {
    let title: String
    let value: String
    let subtitle: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.gray)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.background)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct TodoItem: Identifiable {
    let id = UUID()
    let title: String
}

struct ContentView: View {
    let sidebarItems = [
        SidebarItem(title: "Home", icon: "house.fill"),
        SidebarItem(title: "Dictionary", icon: "book.fill"),
        SidebarItem(title: "History", icon: "clock.fill"),
        SidebarItem(title: "Settings", icon: "gear")
    ]
    
    let todoItems = [
        TodoItem(title: "Send a message"),
        TodoItem(title: "Respond to an email"),
        TodoItem(title: "Ask AI a question"),
        TodoItem(title: "Use Flow hands-free for longer dictations"),
        TodoItem(title: "Learn about whispering mode")
    ]
    
    var body: some View {
        NavigationSplitView {
            List(sidebarItems) { item in
                HStack {
                    Image(systemName: item.icon)
                    Text(item.title)
                }
            }
            .listStyle(SidebarListStyle())
            
            VStack {
                Spacer()
                Text("Trial ends in 90 days")
                    .font(.caption)
                    .padding(.vertical, 4)
                
                Button(action: {}) {
                    Text("Get Flow Pro")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.black)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                .padding(.horizontal)
                
                Button(action: {}) {
                    Text("Refer a friend")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.secondaryBackground)
                        .cornerRadius(8)
                }
                .padding(.horizontal)
            }
            
        } detail: {
            VStack(alignment: .leading, spacing: 20) {
                Text("Good morning, rick")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Hold down fn and speak into any textbox")
                    .foregroundColor(.gray)
                
                // Stats Cards
                HStack(spacing: 16) {
                    StatCard(title: "Weekly streak", 
                            value: "1st week",
                            subtitle: "You are off to a great start!")
                    
                    StatCard(title: "Average Flowing speed",
                            value: "52 WPM",
                            subtitle: "Faster than 90% of typers")
                    
                    StatCard(title: "Total words dictated",
                            value: "6 🔥",
                            subtitle: "You've written 1 brand tagline!")
                }
                
                // Todo Section
                VStack(alignment: .leading, spacing: 16) {
                    Text("To do items")
                        .font(.headline)
                    
                    Text("0/5 steps completed")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    ForEach(todoItems) { item in
                        HStack {
                            Circle()
                                .strokeBorder(Color.gray, lineWidth: 1)
                                .frame(width: 20, height: 20)
                            
                            Text(item.title)
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 8)
                    }
                }
                .padding()
                .background(Color.secondaryBackground)
                .cornerRadius(12)
                
                // Beta Card
                HStack {
                    VStack(alignment: .leading) {
                        Text("Flow iOS Beta Now Available for Pro Users")
                            .font(.headline)
                        
                        Button(action: {}) {
                            Text("Upgrade to Pro")
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.secondaryBackground)
                                .cornerRadius(8)
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "iphone")
                        .font(.system(size: 40))
                }
                .padding()
                .background(Color.purple.opacity(0.2))
                .cornerRadius(12)
                
                Spacer()
            }
            .padding()
        }
    }
}

#Preview {
    ContentView()
}
